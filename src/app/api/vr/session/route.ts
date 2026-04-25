import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canEnterVR, getUpgradeRecommendation } from "@/lib/billing/entitlements";
import { getUserBillingSnapshot, incrementUsageCounter } from "@/lib/billing/usage";
import { canReachDatabase } from "@/lib/db-health";
import { recordUsageEvent } from "@/lib/observability/events";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { z } from "zod";

const vrSessionSchema = z.object({
  mode: z.string().min(3).max(40).default("fallback-3d"),
  voiceEnabled: z.boolean().default(false),
  challengeSlug: z.string().max(160).optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`vr:${session?.user?.id ?? getClientIp(request)}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!session?.user?.id) return Response.json({ ok: true, persisted: false });
  const billing = await getUserBillingSnapshot(session.user.id);
  if (!canEnterVR(billing.plan.id)) {
    return Response.json(
      {
        error: "Full immersive mode requires Elite, Team, or Enterprise.",
        previewOnly: true,
        upgrade: getUpgradeRecommendation(billing.plan.id, "vr")
      },
      { status: 402 }
    );
  }
  if (!(await canReachDatabase())) return Response.json({ ok: true, persisted: false });

  const body = await request.json().catch(() => ({}));
  const parsed = vrSessionSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid VR session payload.", details: parsed.error.flatten() }, { status: 400 });
  const challenge = parsed.data.challengeSlug
    ? await prisma.challenge.findUnique({ where: { slug: parsed.data.challengeSlug }, select: { id: true } })
    : null;

  const vrSession = await prisma.vRSession.create({
    data: {
      userId: session.user.id,
      challengeId: challenge?.id,
      mode: parsed.data.mode,
      voiceEnabled: parsed.data.voiceEnabled,
      metadata: (parsed.data.metadata ?? {}) as Prisma.InputJsonValue
    }
  });

  await recordUsageEvent({
    userId: session.user.id,
    event: "vr.session",
    entityType: challenge ? "challenge" : "vr",
    entityId: parsed.data.challengeSlug,
    metadata: {
      mode: parsed.data.mode,
      voiceEnabled: parsed.data.voiceEnabled,
      persistedSessionId: vrSession.id
    }
  });
  await incrementUsageCounter(session.user.id, "monthly", "vrSessionsUsed").catch(() => null);

  return Response.json({ ok: true, persisted: true, sessionId: vrSession.id });
}
