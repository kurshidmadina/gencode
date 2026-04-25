import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions, isAdmin } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { listChallenges } from "@/lib/repositories/challenges";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/security/admin-audit";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { sanitizePlainText, sanitizeStringArray } from "@/lib/security/sanitize";
import { challengeCreateSchema, challengeQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const limit = rateLimit(`challenges:list:${getClientIp(request)}`, 120);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const url = new URL(request.url);
  const parsed = challengeQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return Response.json({ error: "Invalid challenge filters.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { page, pageSize, ...filters } = parsed.data;
  const challenges = await listChallenges(filters);
  const start = (page - 1) * pageSize;
  const paged = challenges.slice(start, start + pageSize);
  return Response.json({
    challenges: paged,
    total: challenges.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(challenges.length / pageSize)),
    hasMore: start + pageSize < challenges.length
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Admin role required." }, { status: 403 });
  const limit = rateLimit(`admin:challenge:create:${session?.user?.id ?? "unknown"}:${getClientIp(request)}`, 20);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Start Postgres before creating challenges." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = challengeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid challenge data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { examples, successCriteria, validationMetadata, relatedChallenges, ...challengeData } = parsed.data;
  const challenge = await prisma.challenge.create({
    data: {
      ...challengeData,
      title: sanitizePlainText(challengeData.title, 140),
      subtitle: challengeData.subtitle ? sanitizePlainText(challengeData.subtitle, 180) : undefined,
      description: sanitizePlainText(challengeData.description, 8000),
      story: sanitizePlainText(challengeData.story, 8000),
      instructions: sanitizePlainText(challengeData.instructions, 10_000),
      tags: sanitizeStringArray(challengeData.tags, 12, 32),
      learningObjective: challengeData.learningObjective
        ? sanitizePlainText(challengeData.learningObjective, 1000)
        : "Practice a real technical skill with clear feedback.",
      explanation: challengeData.explanation
        ? sanitizePlainText(challengeData.explanation, 10_000)
        : "Admin-created challenge. Add a full explanation before publishing.",
      testCases: (examples ?? []) as Prisma.InputJsonValue,
      hiddenTestCases: [],
      validationMetadata: (validationMetadata ?? { kind: challengeData.type }) as Prisma.InputJsonValue,
      examples: (examples ?? []) as Prisma.InputJsonValue,
      relatedChallenges: relatedChallenges ?? [],
      successCriteria: (successCriteria ?? ["Challenge has clear instructions", "Visible checks are defined"]) as Prisma.InputJsonValue,
      unlockRules: { requiredCompletions: {} }
    }
  });
  await recordAdminAudit({
    actorId: session?.user?.id,
    action: "challenge.create",
    target: "challenge",
    targetId: challenge.id,
    metadata: { slug: challenge.slug, difficulty: challenge.difficulty, type: challenge.type }
  });

  return Response.json({ challenge }, { status: 201 });
}
