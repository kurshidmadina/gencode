import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { getUserChallengeAccess } from "@/lib/game/access";
import { prisma } from "@/lib/prisma";
import { evaluateAchievementAwards } from "@/lib/game/achievements";
import { calculateStreak, calculateSubmissionRewards, getLevelForXp } from "@/lib/game/progression";
import type { CategorySlug, ChallengeType, Difficulty } from "@/lib/game/types";
import {
  asCriteriaRecord,
  questGoal,
  questMatchesCompletion,
  resolveBestScore,
  resolveProgressStatus,
  startOfDay,
  startOfWeek
} from "@/lib/game/submission-progress";
import { findChallenge } from "@/lib/repositories/challenges";
import { recordUsageEvent } from "@/lib/observability/events";
import { logWarn } from "@/lib/observability/logger";
import { getChallengeRunner } from "@/lib/runner";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { runSubmissionSchema } from "@/lib/validators";

async function bumpQuestRows({
  tx,
  userId,
  categorySlug,
  difficulty,
  usedHints,
  now
}: {
  tx: Prisma.TransactionClient;
  userId: string;
  categorySlug: CategorySlug;
  difficulty: Difficulty;
  usedHints: number;
  now: Date;
}) {
  let updated = 0;
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const week = startOfWeek(now);
  const nextWeek = new Date(week);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const dailyQuests = await tx.dailyQuest.findMany({ where: { active: true } });
  for (const quest of dailyQuests) {
    const criteria = asCriteriaRecord(quest.criteria);
    if (!questMatchesCompletion({ criteria, categorySlug, difficulty, usedHints })) continue;
    const goal = questGoal(criteria);
    const current = await tx.userDailyQuest.findFirst({
      where: { userId, questId: quest.id, assignedFor: { gte: today, lt: tomorrow } }
    });
    const progress = Math.min(goal, (current?.progress ?? 0) + 1);
    const completedAt = current?.completedAt ?? (progress >= goal ? now : null);
    if (current) {
      await tx.userDailyQuest.update({ where: { id: current.id }, data: { progress, goal, completedAt } });
    } else {
      await tx.userDailyQuest.create({ data: { userId, questId: quest.id, progress, goal, completedAt, assignedFor: today } });
    }
    updated += 1;
  }

  const weeklyQuests = await tx.weeklyQuest.findMany({ where: { active: true } });
  for (const quest of weeklyQuests) {
    const criteria = asCriteriaRecord(quest.criteria);
    if (!questMatchesCompletion({ criteria, categorySlug, difficulty, usedHints })) continue;
    const goal = questGoal(criteria);
    const current = await tx.userWeeklyQuest.findFirst({
      where: { userId, questId: quest.id, assignedFor: { gte: week, lt: nextWeek } }
    });
    const progress = Math.min(goal, (current?.progress ?? 0) + 1);
    const completedAt = current?.completedAt ?? (progress >= goal ? now : null);
    if (current) {
      await tx.userWeeklyQuest.update({ where: { id: current.id }, data: { progress, goal, completedAt } });
    } else {
      await tx.userWeeklyQuest.create({ data: { userId, questId: quest.id, progress, goal, completedAt, assignedFor: week } });
    }
    updated += 1;
  }

  return updated;
}

async function awardUserAchievements(userId: string) {
  const [user, completed, hints] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { include: { category: true } } }
    }),
    prisma.challengeHintUsage.findMany({ where: { userId } })
  ]);
  if (!user) return;

  const hintedChallengeIds = new Set(hints.map((hint) => hint.challengeId));
  const categoryCounts: Partial<Record<CategorySlug, number>> = {};
  const difficultyCounts: Partial<Record<Difficulty, number>> = {};
  const typeCounts: Partial<Record<ChallengeType, number>> = {};

  for (const item of completed) {
    const category = item.challenge.category.slug as CategorySlug;
    const difficulty = item.challenge.difficulty as Difficulty;
    const type = item.challenge.type as ChallengeType;
    categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
    difficultyCounts[difficulty] = (difficultyCounts[difficulty] ?? 0) + 1;
    typeCounts[type] = (typeCounts[type] ?? 0) + 1;
  }

  const speedCompletions = completed.filter((item) => item.timeSpent > 0 && item.timeSpent <= item.challenge.estimatedTime * 60).length;
  const slugs = evaluateAchievementAwards({
    completedTotal: completed.length,
    categoryCounts,
    difficultyCounts,
    typeCounts,
    streak: user.streak,
    noHintCompletions: completed.filter((item) => !hintedChallengeIds.has(item.challengeId)).length,
    speedCompletions,
    level: user.level
  });

  const achievements = await prisma.achievement.findMany({ where: { slug: { in: slugs } } });
  await prisma.userAchievement.createMany({
    data: achievements.map((achievement) => ({ userId, achievementId: achievement.id })),
    skipDuplicates: true
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`submit:${session?.user?.id ?? getClientIp(request)}:${slug}`, 20);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const challenge = await findChallenge(slug);
  if (!challenge) return Response.json({ error: "Challenge not found." }, { status: 404 });
  const access = await getUserChallengeAccess(session?.user?.id, challenge);
  if (access.locked) return Response.json({ error: access.reason, locked: true }, { status: 423 });

  const body = await request.json().catch(() => null);
  const parsed = runSubmissionSchema.safeParse({ ...body, mode: "submit" });
  if (!parsed.success) {
    return Response.json({ error: "Invalid answer.", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await getChallengeRunner().run({
    challenge,
    answer: parsed.data.answer,
    mode: "submit",
    userId: session?.user?.id,
    requestId: crypto.randomUUID()
  });

  if (!session?.user?.id || !(await canReachDatabase())) {
    return Response.json({
      ...result,
      persisted: false,
      reward: result.status === "PASSED" ? { xp: challenge.xpReward, coins: challenge.coinReward } : { xp: 0, coins: 0 }
    });
  }

  const userId = session.user.id;

  try {
    const dbChallenge = await prisma.challenge.findUnique({ where: { slug } });
    if (!dbChallenge) throw new Error("Challenge not seeded");

    const existing = await prisma.userProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId: dbChallenge.id } }
    });
    const firstCompletion = result.status === "PASSED" && existing?.status !== "COMPLETED";
    const usedHints = await prisma.challengeHintUsage.count({
      where: { userId, challengeId: dbChallenge.id }
    });
    const reward = calculateSubmissionRewards({
      difficulty: challenge.difficulty,
      score: result.score,
      usedHints,
      firstCompletion
    });

    let persistedSubmissionId: string | null = null;
    let progressedQuests = 0;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.create({
        data: {
          userId,
          challengeId: dbChallenge.id,
          submittedCode: parsed.data.answer,
          status: result.status,
          score: result.score,
          runtime: result.runtime,
          memory: result.memory,
          testResults: result.testResults
        }
      });
      persistedSubmissionId = submission.id;

      await tx.submissionAuditLog.create({
        data: {
          userId,
          submissionId: submission.id,
          action: "submission.received",
          metadata: {
            challengeSlug: slug,
            challengeType: challenge.type,
            difficulty: challenge.difficulty,
            status: result.status,
            score: result.score,
            runner: getChallengeRunner().name
          }
        }
      });

      await tx.testResult.createMany({
        data: result.testResults.map((test) => ({
          submissionId: submission.id,
          name: test.name,
          passed: test.passed,
          expected: test.expected,
          actual: test.actual,
          message: test.message,
          runtime: result.runtime
        }))
      });

      await tx.userProgress.upsert({
        where: { userId_challengeId: { userId, challengeId: dbChallenge.id } },
        create: {
          userId,
          challengeId: dbChallenge.id,
          status: result.status === "PASSED" ? "COMPLETED" : "IN_PROGRESS",
          bestScore: result.score,
          attempts: 1,
          completedAt: result.status === "PASSED" ? now : null,
          lastSubmittedAt: now
        },
        update: {
          status: resolveProgressStatus({ resultStatus: result.status, existingStatus: existing?.status }),
          bestScore: resolveBestScore(existing?.bestScore, result.score),
          attempts: { increment: 1 },
          completedAt: result.status === "PASSED" ? (existing?.completedAt ?? now) : (existing?.completedAt ?? null),
          lastSubmittedAt: now
        }
      });

      if (result.status === "PASSED" && firstCompletion) {
        progressedQuests = await bumpQuestRows({
          tx,
          userId,
          categorySlug: challenge.categorySlug,
          difficulty: challenge.difficulty,
          usedHints,
          now
        });
      }

      if (reward.xp > 0 || reward.coins > 0) {
        const currentUser = await tx.user.findUnique({ where: { id: userId } });
        const nextXp = (currentUser?.xp ?? 0) + reward.xp;
        const nextLevel = getLevelForXp(nextXp).level;
        await tx.user.update({
          where: { id: userId },
          data: {
            xp: { increment: reward.xp },
            coins: { increment: reward.coins },
            level: nextLevel,
            streak: calculateStreak(currentUser?.lastActiveAt, currentUser?.streak ?? 0, now),
            lastActiveAt: now
          }
        });
        await tx.xPTransaction.create({
          data: {
            userId,
            amount: reward.xp,
            reason: `Completed ${challenge.title}`,
            metadata: { challengeSlug: slug, score: result.score }
          }
        });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: reward.coins,
            reason: `Completed ${challenge.title}`,
            metadata: { challengeSlug: slug, score: result.score }
          }
        });
        await tx.categoryProgress.upsert({
          where: { userId_categoryId: { userId, categoryId: dbChallenge.categoryId } },
          create: {
            userId,
            categoryId: dbChallenge.categoryId,
            xp: reward.xp,
            completedChallenges: firstCompletion ? 1 : 0,
            bestDifficulty: challenge.difficulty,
            accuracy: result.score,
            averageAttempts: existing?.attempts ? existing.attempts + 1 : 1
          },
          update: {
            xp: { increment: reward.xp },
            completedChallenges: { increment: firstCompletion ? 1 : 0 },
            bestDifficulty: challenge.difficulty,
            accuracy: result.score,
            averageAttempts: existing?.attempts ? existing.attempts + 1 : 1
          }
        });
      }
    });

    if (result.status === "PASSED") {
      await awardUserAchievements(userId);
    }

    await recordUsageEvent({
      userId,
      event: "challenge.submit",
      entityType: "challenge",
      entityId: dbChallenge.id,
        metadata: {
        slug,
        submissionId: persistedSubmissionId,
        status: result.status,
        score: result.score,
        reward,
        progressedQuests
      }
    });

    return Response.json({ ...result, persisted: true, reward, questProgress: { updated: progressedQuests } });
  } catch (error) {
    logWarn("challenge_submission.persist_failed", {
      userId,
      challengeSlug: slug,
      error: error instanceof Error ? error.message : String(error)
    });
    return Response.json({
      ...result,
      persisted: false,
      reward: result.status === "PASSED" ? { xp: challenge.xpReward, coins: challenge.coinReward } : { xp: 0, coins: 0 }
    });
  }
}
