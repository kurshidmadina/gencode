import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canAccessBossBattle, getUpgradeRecommendation } from "@/lib/billing/entitlements";
import { getUserBillingSnapshot, incrementUsageCounter } from "@/lib/billing/usage";
import { canReachDatabase } from "@/lib/db-health";
import { getBossBattle } from "@/lib/game/boss-battles";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const bossProgressSchema = z.object({
  stageIndex: z.number().int().min(0).max(20),
  score: z.number().int().min(0).max(100).default(0),
  status: z.enum(["STARTED", "STAGE_CLEARED", "COMPLETED"]).default("STARTED"),
  notes: z.string().max(1200).optional()
});

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !(await canReachDatabase())) return Response.json({ progress: null, attempts: [], persisted: false });

  const boss = await prisma.bossBattle.findUnique({
    where: { slug },
    include: {
      progress: { where: { userId: session.user.id }, take: 1 },
      stageAttempts: {
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 12
      }
    }
  });

  if (!boss) return Response.json({ error: "Boss battle not found." }, { status: 404 });
  return Response.json({ progress: boss.progress[0] ?? null, attempts: boss.stageAttempts, persisted: true });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Login required to persist boss progress." }, { status: 401 });
  const limit = rateLimit(`boss:${session.user.id}:${getClientIp(request)}:${slug}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = bossProgressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid boss progress payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  const bossDefinition = getBossBattle(slug);
  if (!bossDefinition) return Response.json({ error: "Boss battle not found." }, { status: 404 });
  const billing = await getUserBillingSnapshot(session.user.id);
  if (!canAccessBossBattle(billing.plan.id, bossDefinition.difficulty)) {
    return Response.json(
      {
        error: "Boss battle progression requires Pro or higher.",
        previewOnly: true,
        upgrade: getUpgradeRecommendation(billing.plan.id, "boss-battle", bossDefinition.difficulty)
      },
      { status: 402 }
    );
  }
  if (parsed.data.stageIndex >= bossDefinition.stages.length) return Response.json({ error: "Unknown boss stage." }, { status: 400 });
  if (!(await canReachDatabase())) return Response.json({ error: "Database is not reachable. Boss progress cannot be saved." }, { status: 503 });

  const boss = await prisma.bossBattle.findUnique({
    where: { slug },
    include: { stages: { orderBy: { order: "asc" } } }
  });
  if (!boss) return Response.json({ error: "Boss battle has not been seeded." }, { status: 404 });

  const stage = boss.stages[parsed.data.stageIndex] ?? null;
  const status = parsed.data.status === "COMPLETED" || parsed.data.stageIndex >= boss.stages.length - 1 ? "COMPLETED" : "ACTIVE";
  const currentStage = parsed.data.status === "STAGE_CLEARED" ? Math.min(parsed.data.stageIndex + 1, boss.stages.length - 1) : parsed.data.stageIndex;

  const [progress, attempt] = await prisma.$transaction(async (tx) => {
    const existingProgress = await tx.userBossBattleProgress.findUnique({
      where: { userId_bossBattleId: { userId: session.user.id, bossBattleId: boss.id } },
      select: { bestScore: true }
    });
    const bestScore = Math.max(existingProgress?.bestScore ?? 0, parsed.data.score);
    const savedProgress = await tx.userBossBattleProgress.upsert({
      where: { userId_bossBattleId: { userId: session.user.id, bossBattleId: boss.id } },
      create: {
        userId: session.user.id,
        bossBattleId: boss.id,
        currentStage,
        bestScore,
        status,
        completedAt: status === "COMPLETED" ? new Date() : null
      },
      update: {
        currentStage,
        bestScore,
        status,
        completedAt: status === "COMPLETED" ? new Date() : undefined
      }
    });

    const savedAttempt = await tx.bossBattleStageAttempt.create({
      data: {
        userId: session.user.id,
        bossBattleId: boss.id,
        stageId: stage?.id ?? null,
        stageIndex: parsed.data.stageIndex,
        status: parsed.data.status,
        score: parsed.data.score,
        notes: parsed.data.notes,
        metadata: {
          bossSlug: slug,
          stageTitle: bossDefinition.stages[parsed.data.stageIndex]?.title,
          validation: bossDefinition.stages[parsed.data.stageIndex]?.validation
        } satisfies Prisma.InputJsonValue
      }
    });

    return [savedProgress, savedAttempt] as const;
  });
  await incrementUsageCounter(session.user.id, "monthly", "bossBattlesAttempted").catch(() => null);

  return Response.json({ persisted: true, progress, attempt });
}
