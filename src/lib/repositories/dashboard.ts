import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { canReachDatabase } from "@/lib/db-health";
import { challengeCatalog } from "@/lib/game/challenge-data";
import { canUnlockDifficulty, getLevelForXp, getRankName } from "@/lib/game/progression";
import { categories, type Difficulty } from "@/lib/game/types";
import { rankLeaderboardPlayers } from "@/lib/game/leaderboard";
import { getLearningPath, learningPaths } from "@/lib/game/learning-paths";

export async function getDashboardStats(userId?: string) {
  if (!userId || !(await canReachDatabase())) {
    const xp = 2840;
    const level = getLevelForXp(xp);
    return {
      xp,
      level: level.level,
      levelProgress: level.progressPercent,
      rank: getRankName(level.level),
      coins: 410,
      streak: 6,
      completed: 27,
      leaderboardRank: 18,
      weakAreas: ["SQL window functions", "Linux services", "Graph traversal"],
      strongAreas: ["Debugging", "Linux commands", "API contracts"],
      dailyQuests: [
        { title: "Complete 3 Easy challenges", progress: 1, goal: 3 },
        { title: "Solve 1 SQL challenge", progress: 0, goal: 1 },
        { title: "Maintain streak", progress: 1, goal: 1 }
      ],
      weeklyQuests: [
        { title: "Clear 3 Hard missions", progress: 1, goal: 3 },
        { title: "Complete 8 missions in one category", progress: 4, goal: 8 }
      ],
      recentSubmissions: [
        { title: "Repair permissions", status: "PASSED", score: 100 },
        { title: "Stabilize joins", status: "PARTIAL", score: 67 },
        { title: "Trace binary search", status: "PASSED", score: 100 }
      ],
      recommended: challengeCatalog.slice(0, 5),
      badges: ["First Blood", "SQL Starter", "No Hint Hero"],
      categoryMastery: categories.slice(0, 8).map((category, index) => ({
        slug: category.slug,
        name: category.name,
        mastery: Math.max(18, 86 - index * 7),
        completed: Math.max(1, 12 - index),
        accuracy: Math.max(52, 91 - index * 3)
      })),
      accuracy: 78,
      averageAttempts: 1.8,
      recommendedPath: learningPaths[0]
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true }, take: 8 },
        categoryProgress: { include: { category: true }, orderBy: { xp: "desc" }, take: 16 },
        dailyQuests: {
          include: { quest: true },
          orderBy: { assignedFor: "desc" },
          take: 4
        },
        weeklyQuests: {
          include: { quest: true },
          orderBy: { assignedFor: "desc" },
          take: 4
        },
        onboardingProfile: true,
        submissions: {
          include: { challenge: true },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      }
    });

    if (!user) throw new Error("User not found");

    const level = getLevelForXp(user.xp);
    const completed = await prisma.userProgress.count({
      where: { userId, status: "COMPLETED" }
    });
    const progress = await prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { include: { category: true } } }
    });
    const completionsByDifficulty = progress.reduce<Partial<Record<Difficulty, number>>>((acc, item) => {
      const difficulty = item.challenge.difficulty as Difficulty;
      acc[difficulty] = (acc[difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const completedSlugs = new Set(progress.map((item) => item.challenge.slug));
    const path = getLearningPath(user.onboardingProfile?.recommendedPathSlug ?? "");
    const pathSlugs = path ? new Set(path.challengeSlugs) : null;
    const recommended = challengeCatalog
      .filter((challenge) => !completedSlugs.has(challenge.slug))
      .filter((challenge) => canUnlockDifficulty(challenge.difficulty, completionsByDifficulty))
      .sort((a, b) => Number(pathSlugs?.has(b.slug) ?? false) - Number(pathSlugs?.has(a.slug) ?? false))
      .slice(0, 5);
    const leaderboardRank =
      (await prisma.user.count({
        where: { xp: { gt: user.xp } }
      })) + 1;
    const categoryMastery =
      user.categoryProgress.length > 0
        ? user.categoryProgress.map((item) => ({
            slug: item.category.slug,
            name: item.category.name,
            mastery: Math.min(100, Math.round((item.completedChallenges / 25) * 100)),
            completed: item.completedChallenges,
            accuracy: item.accuracy
          }))
        : categories.slice(0, 8).map((category) => ({
            slug: category.slug,
            name: category.name,
            mastery: 0,
            completed: 0,
            accuracy: 0
          }));
    const sortedByMastery = [...categoryMastery].sort((a, b) => b.mastery - a.mastery);
    const dailyQuests =
      user.dailyQuests.length > 0
        ? user.dailyQuests.map((item) => ({
            title: item.quest.title,
            progress: item.progress,
            goal: item.goal
          }))
        : [
            {
              title: completed === 0 ? "Complete your first starter mission" : "Complete 3 Easy challenges",
              progress: completed === 0 ? 0 : Math.min(1, completed),
              goal: completed === 0 ? 1 : 3
            },
            { title: "Ask Genie for one review", progress: 0, goal: 1 },
            { title: "Protect the streak", progress: user.streak > 0 ? 1 : 0, goal: 1 }
          ];
    const weeklyQuests =
      user.weeklyQuests.length > 0
        ? user.weeklyQuests.map((item) => ({
            title: item.quest.title,
            progress: item.progress,
            goal: item.goal
          }))
        : [
            { title: "Clear 3 Hard missions", progress: completionsByDifficulty.HARD ?? 0, goal: 3 },
            { title: "Complete 8 missions in one category", progress: Math.max(...categoryMastery.map((item) => item.completed), 0), goal: 8 }
          ];

    return {
      xp: user.xp,
      level: level.level,
      levelProgress: level.progressPercent,
      rank: getRankName(level.level),
      coins: user.coins,
      streak: user.streak,
      completed,
      leaderboardRank,
      weakAreas: sortedByMastery.slice(-3).reverse().map((item) => item.name),
      strongAreas: sortedByMastery.slice(0, 3).map((item) => item.name),
      dailyQuests,
      weeklyQuests,
      recentSubmissions: user.submissions.map((submission) => ({
        title: submission.challenge.title,
        status: submission.status,
        score: submission.score
      })),
      recommended,
      badges: user.badges.map((badge) => badge.badge.name),
      categoryMastery,
      accuracy: categoryMastery.length ? Math.round(categoryMastery.reduce((sum, item) => sum + item.accuracy, 0) / categoryMastery.length) : 0,
      averageAttempts: progress.length ? Number((progress.reduce((sum, item) => sum + item.attempts, 0) / progress.length).toFixed(1)) : 0,
      recommendedPath: path
    };
  } catch {
    return getDashboardStats(undefined);
  }
}

export async function getLeaderboard(scope = "global", category?: string, difficulty?: string) {
  if (!(await canReachDatabase())) {
    return [
      { rank: 1, username: "kernel_arya", xp: 18420, completed: 146, streak: 31, hardCompletions: 29, extremeCompletions: 9, insaneCompletions: 4, noHintCompletions: 58, speedCompletions: 22 },
      { rank: 2, username: "queryforge", xp: 17210, completed: 139, streak: 18, hardCompletions: 24, extremeCompletions: 7, insaneCompletions: 3, noHintCompletions: 51, speedCompletions: 18 },
      { rank: 3, username: "stackpilot", xp: 15990, completed: 128, streak: 22, hardCompletions: 22, extremeCompletions: 6, insaneCompletions: 2, noHintCompletions: 49, speedCompletions: 15 },
      { rank: 4, username: "bashvector", xp: 14330, completed: 116, streak: 14, hardCompletions: 18, extremeCompletions: 4, insaneCompletions: 1, noHintCompletions: 43, speedCompletions: 13 },
      { rank: 5, username: "bughunter7", xp: 13200, completed: 109, streak: 9, hardCompletions: 17, extremeCompletions: 3, insaneCompletions: 1, noHintCompletions: 39, speedCompletions: 11 }
    ];
  }

  try {
    const since = scope === "weekly" ? subDays(new Date(), 7) : scope === "monthly" ? subDays(new Date(), 30) : undefined;
    const isScoped = Boolean(since || category || difficulty);
    const users = await prisma.user.findMany({
      orderBy: [{ xp: "desc" }, { streak: "desc" }],
      take: 100,
      include: {
        hintUsage: true,
        submissions: {
          where: {
            status: "PASSED",
            createdAt: since ? { gte: since } : undefined,
            challenge: {
              ...(category ? { category: { slug: category } } : {}),
              ...(difficulty ? { difficulty: difficulty as Difficulty } : {})
            }
          },
          include: { challenge: true }
        }
      }
    });

    if (users.length > 0) {
      const entrants = users
        .map((user) => {
          const scopedXp = user.submissions.reduce((sum, submission) => sum + Math.round((submission.challenge.xpReward * submission.score) / 100), 0);
          return {
            username: user.username ?? user.name ?? "anonymous",
            xp: isScoped ? scopedXp : user.xp,
            completed: user.submissions.length,
            streak: user.streak,
            hardCompletions: user.submissions.filter((s) => s.challenge.difficulty === "HARD").length,
            extremeCompletions: user.submissions.filter((s) => s.challenge.difficulty === "EXTREME").length,
            insaneCompletions: user.submissions.filter((s) => s.challenge.difficulty === "INSANE").length,
            noHintCompletions: Math.max(0, user.submissions.length - user.hintUsage.length),
            speedCompletions: user.submissions.filter((s) => s.runtime !== null && s.runtime <= 300).length
          };
        })
        .filter((user) => !isScoped || user.completed > 0);

      if (entrants.length > 0) return rankLeaderboardPlayers(entrants).slice(0, 25);
    }
  } catch {
    // Static fallback below.
  }

  return [
    { rank: 1, username: "kernel_arya", xp: 18420, completed: 146, streak: 31, hardCompletions: 29, extremeCompletions: 9, insaneCompletions: 4, noHintCompletions: 58, speedCompletions: 22 },
    { rank: 2, username: "queryforge", xp: 17210, completed: 139, streak: 18, hardCompletions: 24, extremeCompletions: 7, insaneCompletions: 3, noHintCompletions: 51, speedCompletions: 18 },
    { rank: 3, username: "stackpilot", xp: 15990, completed: 128, streak: 22, hardCompletions: 22, extremeCompletions: 6, insaneCompletions: 2, noHintCompletions: 49, speedCompletions: 15 },
    { rank: 4, username: "bashvector", xp: 14330, completed: 116, streak: 14, hardCompletions: 18, extremeCompletions: 4, insaneCompletions: 1, noHintCompletions: 43, speedCompletions: 13 },
    { rank: 5, username: "bughunter7", xp: 13200, completed: 109, streak: 9, hardCompletions: 17, extremeCompletions: 3, insaneCompletions: 1, noHintCompletions: 39, speedCompletions: 11 }
  ];
}
