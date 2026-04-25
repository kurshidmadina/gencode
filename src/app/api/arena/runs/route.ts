import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { arenaModes, scoreArenaRun } from "@/lib/game/arena";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const startSchema = z.object({
  action: z.literal("start"),
  modeSlug: z.string().min(2).max(80),
  challengeSlugs: z.array(z.string().min(2).max(160)).min(1).max(12)
});

const completeSchema = z.object({
  action: z.literal("complete"),
  runId: z.string().nullable().optional(),
  modeSlug: z.string().min(2).max(80),
  challengeSlugs: z.array(z.string().min(2).max(160)).min(1).max(12),
  correct: z.number().int().min(0).max(50),
  attempted: z.number().int().min(1).max(50),
  secondsRemaining: z.number().int().min(0).max(20_000),
  hintsUsed: z.number().int().min(0).max(50)
});

const arenaRunSchema = z.discriminatedUnion("action", [startSchema, completeSchema]);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ runs: [] });
  if (!(await canReachDatabase())) return Response.json({ runs: [], persisted: false });

  const runs = await prisma.arenaRun.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 8
  });

  return Response.json({ runs, persisted: true });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`arena:${session?.user?.id ?? getClientIp(request)}`, 25);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = arenaRunSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid arena run payload.", details: parsed.error.flatten() }, { status: 400 });
  }

  const mode = arenaModes.find((item) => item.slug === parsed.data.modeSlug);
  if (!mode) return Response.json({ error: "Unknown arena mode." }, { status: 404 });

  if (parsed.data.action === "start") {
    if (!session?.user?.id || !(await canReachDatabase())) {
      return Response.json({
        persisted: false,
        runId: null,
        startedAt: new Date().toISOString(),
        message: "Arena started locally. Login with a reachable database to persist run history."
      });
    }

    const run = await prisma.arenaRun.create({
      data: {
        userId: session.user.id,
        modeSlug: mode.slug,
        challengeSlugs: parsed.data.challengeSlugs,
        metadata: {
          modeName: mode.name,
          durationMinutes: mode.durationMinutes,
          categories: mode.categories,
          difficulties: mode.difficulties
        } satisfies Prisma.InputJsonValue
      }
    });

    return Response.json({ persisted: true, runId: run.id, startedAt: run.startedAt });
  }

  const completion = parsed.data;
  const score = scoreArenaRun({
    correct: completion.correct,
    attempted: completion.attempted,
    secondsRemaining: completion.secondsRemaining,
    hintsUsed: completion.hintsUsed
  });

  if (!session?.user?.id || !(await canReachDatabase())) {
    return Response.json({
      persisted: false,
      ...score,
      rewardPreview: mode.rewards,
      message: "Arena result scored locally. Login with a reachable database to persist history."
    });
  }

  const runData = {
    userId: session.user.id,
    modeSlug: mode.slug,
    status: "COMPLETED",
    challengeSlugs: completion.challengeSlugs,
    score: score.score,
    accuracy: score.accuracy,
    speedBonus: score.speedBonus,
    noHintBonus: score.noHintBonus,
    correct: completion.correct,
    attempted: completion.attempted,
    secondsRemaining: completion.secondsRemaining,
    hintsUsed: completion.hintsUsed,
    endedAt: new Date(),
    metadata: {
      modeName: mode.name,
      rewardPreview: mode.rewards,
      rules: mode.rules
    } satisfies Prisma.InputJsonValue
  };

  const existingRunId = completion.runId ?? undefined;
  const run =
    existingRunId
      ? await prisma.arenaRun.updateMany({
          where: { id: existingRunId, userId: session.user.id },
          data: runData
        }).then(async (update) => {
          if (update.count > 0) return prisma.arenaRun.findUnique({ where: { id: existingRunId } });
          return prisma.arenaRun.create({ data: runData });
        })
      : await prisma.arenaRun.create({ data: runData });

  return Response.json({ persisted: true, runId: run?.id, ...score, rewardPreview: mode.rewards });
}
