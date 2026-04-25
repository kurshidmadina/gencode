import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { buildAssistantContext } from "@/lib/assistant/context";
import { getAssistantProvider } from "@/lib/assistant/providers";
import { canReachDatabase } from "@/lib/db-health";
import { recordUsageEvent } from "@/lib/observability/events";
import { logWarn } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { assistantMessageSchema } from "@/lib/validators";

function toJsonInput(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`assistant:${session?.user?.id ?? getClientIp(request)}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const body = await request.json().catch(() => null);
  const parsed = assistantMessageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid assistant message.", details: parsed.error.flatten() }, { status: 400 });
  }

  const dbReady = await canReachDatabase();
  const assistantContext = await buildAssistantContext({
    userId: session?.user?.id,
    username: session?.user?.username ?? session?.user?.name,
    challengeSlug: parsed.data.challengeSlug,
    clientContext: {
      currentCode: parsed.data.currentCode,
      failedTests: parsed.data.failedTests,
      attempts: parsed.data.attempts,
      hintLevel: parsed.data.hintLevel,
      hintUsage: parsed.data.hintUsage,
      allowSolution: parsed.data.allowSolution,
      completed: parsed.data.completed,
      voice: parsed.data.voice
    }
  });
  const history =
    dbReady && session?.user?.id && parsed.data.sessionId
      ? await prisma.chatMessage
          .findMany({
            where: {
              sessionId: parsed.data.sessionId,
              session: { userId: session.user.id }
            },
            orderBy: { createdAt: "asc" },
            take: 12
          })
          .then((messages) =>
            messages.map((message) => ({
              role: message.role === "ASSISTANT" ? ("assistant" as const) : message.role === "SYSTEM" ? ("system" as const) : ("user" as const),
              content: message.content
            }))
          )
      : [];

  const provider = getAssistantProvider();
  const response = await provider.send({
    message: parsed.data.message,
    mode: parsed.data.mode,
    challengeSlug: parsed.data.challengeSlug,
    history,
    context: assistantContext,
    hintLevel: parsed.data.hintLevel,
    allowSolution: parsed.data.allowSolution
  });

  let chatSessionId = parsed.data.sessionId;
  try {
    if (session?.user?.id && dbReady) {
      const chatSession = chatSessionId
        ? await prisma.chatSession.findFirst({ where: { id: chatSessionId, userId: session.user.id } })
        : await prisma.chatSession.create({
            data: {
              userId: session.user.id,
              title: parsed.data.challengeSlug ? `Genie: ${parsed.data.challengeSlug}` : "Genie session",
              mode: parsed.data.mode,
              context: toJsonInput({
                ...(parsed.data.context ?? {}),
                challengeSlug: parsed.data.challengeSlug,
                hintLevel: assistantContext.client.requestedHintLevel,
                mode: parsed.data.mode
              })
            }
          });

      if (chatSession) {
        chatSessionId = chatSession.id;
        await prisma.chatMessage.createMany({
          data: [
            { sessionId: chatSession.id, role: "USER", content: parsed.data.message },
            {
              sessionId: chatSession.id,
              role: "ASSISTANT",
              content: response.content,
              metadata: toJsonInput({
                ...response.metadata,
                safety: response.safety,
                contextUsed: response.metadata.contextUsed
              })
            }
          ]
        });
      }
    }
  } catch (error) {
    logWarn("assistant.chat_persist_failed", {
      userId: session?.user?.id,
      challengeSlug: parsed.data.challengeSlug,
      error: error instanceof Error ? error.message : String(error)
    });
    // Chat still works when DB is offline.
  }

  await recordUsageEvent({
    userId: session?.user?.id,
    event: "assistant.message",
    entityType: parsed.data.challengeSlug ? "challenge" : "assistant",
    entityId: parsed.data.challengeSlug,
    metadata: {
      mode: parsed.data.mode,
      provider: response.metadata.provider,
      fullSolutionWithheld: response.safety.fullSolutionWithheld,
      hintLevel: response.metadata.hintLevel,
      voice: parsed.data.voice ?? false
    }
  });

  return Response.json({ ...response, sessionId: chatSessionId });
}
