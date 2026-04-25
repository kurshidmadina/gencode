import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";
import { bossBattles } from "../src/lib/game/boss-battles";
import { challengeCatalog } from "../src/lib/game/challenge-data";
import { learningPaths } from "../src/lib/game/learning-paths";
import { getLevelForXp } from "../src/lib/game/progression";
import { shopItems } from "../src/lib/game/shop";
import { categories, type Difficulty } from "../src/lib/game/types";
import { syncSubscriptionPlans } from "../src/lib/billing/sync-plans";
import type { PlanId } from "../src/lib/billing/plans";

export const DEMO_USER_EMAIL = "demo@gencode.dev";
export const DEMO_USER_PASSWORD = "GencodeDemo!2026";
export const DEMO_ADMIN_EMAIL = "admin@gencode.dev";
export const DEMO_ADMIN_PASSWORD = "GencodeAdmin!2026";

type DemoOperator = {
  email: string;
  password: string;
  username: string;
  name: string;
  role: "USER" | "ADMIN";
  xp: number;
  coins: number;
  streak: number;
  pathSlug: string;
  bio: string;
  favoriteCategories: string[];
  weakestTopics: string[];
  skillGraph: Record<string, number>;
  completedTarget: number;
  accuracyBase: number;
  badges: string[];
  achievements: string[];
  bossStatus: "ACTIVE" | "COMPLETED" | "LOCKED";
  planId: PlanId;
};

const demoOperators: DemoOperator[] = [
  {
    email: DEMO_USER_EMAIL,
    password: DEMO_USER_PASSWORD,
    username: "nova_cli",
    name: "Maya Chen",
    role: "USER",
    xp: 7420,
    coins: 1280,
    streak: 9,
    pathSlug: "sql-analyst",
    bio: "Backend learner training for SQL interviews, Linux incident drills, and no-hint DSA reps.",
    favoriteCategories: ["sql", "linux", "debugging"],
    weakestTopics: ["SQL windows", "graph traversal", "Linux services"],
    skillGraph: { sql: 78, linux: 72, debugging: 84, algorithms: 55, apis: 68 },
    completedTarget: 34,
    accuracyBase: 86,
    badges: ["founder", "first-clear", "query-knight", "terminal-rookie", "bug-slayer"],
    achievements: ["first-blood", "sql-starter", "linux-monk", "seven-day-streak", "no-hint-hero"],
    bossStatus: "ACTIVE",
    planId: "pro"
  },
  {
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    username: "arena_admin",
    name: "Ari Patel",
    role: "ADMIN",
    xp: 21840,
    coins: 4200,
    streak: 31,
    pathSlug: "gencode-legend",
    bio: "Gencode operator reviewing content quality, learner safety, AI usage, and late-game arena balance.",
    favoriteCategories: ["security-basics", "system-design", "algorithms"],
    weakestTopics: ["VR headset telemetry", "boss drop-off analysis"],
    skillGraph: { algorithms: 94, linux: 88, sql: 91, security: 86, systemDesign: 82 },
    completedTarget: 74,
    accuracyBase: 93,
    badges: ["founder", "insane-flame", "kernel-monk", "backend-sentinel", "insane-architect"],
    achievements: ["first-blood", "query-knight", "dsa-climber", "insane-survivor", "thirty-day-streak", "gencode-legend"],
    bossStatus: "COMPLETED",
    planId: "enterprise"
  },
  {
    email: "arya@gencode.dev",
    password: DEMO_USER_PASSWORD,
    username: "kernel_arya",
    name: "Arya Nair",
    role: "USER",
    xp: 18420,
    coins: 3600,
    streak: 28,
    pathSlug: "linux-forensics",
    bio: "Linux incident responder chasing forensics bosses and shell fluency.",
    favoriteCategories: ["linux", "bash", "devops-basics"],
    weakestTopics: ["SQL fraud windows", "API pagination"],
    skillGraph: { linux: 96, bash: 90, devops: 84, sql: 66, apis: 62 },
    completedTarget: 62,
    accuracyBase: 92,
    badges: ["founder", "kernel-monk", "terminal-rookie", "no-hint-hero"],
    achievements: ["first-blood", "linux-monk", "seven-day-streak", "speed-solver"],
    bossStatus: "COMPLETED",
    planId: "elite"
  },
  {
    email: "queryforge@gencode.dev",
    password: DEMO_USER_PASSWORD,
    username: "queryforge",
    name: "Jon Bell",
    role: "USER",
    xp: 17210,
    coins: 3100,
    streak: 18,
    pathSlug: "sql-optimization",
    bio: "Analytics engineer turning SQL drills into production query instincts.",
    favoriteCategories: ["sql", "apis", "debugging"],
    weakestTopics: ["C++ ownership", "graph algorithms"],
    skillGraph: { sql: 95, apis: 78, debugging: 82, algorithms: 59, cpp: 45 },
    completedTarget: 58,
    accuracyBase: 90,
    badges: ["founder", "query-knight", "bug-slayer"],
    achievements: ["first-blood", "sql-starter", "query-knight", "no-hint-hero"],
    bossStatus: "ACTIVE",
    planId: "pro"
  },
  {
    email: "stackpilot@gencode.dev",
    password: DEMO_USER_PASSWORD,
    username: "stackpilot",
    name: "Iris Morgan",
    role: "USER",
    xp: 15990,
    coins: 2800,
    streak: 22,
    pathSlug: "dsa-interview",
    bio: "Interview candidate drilling DSA, debugging, and explanation clarity.",
    favoriteCategories: ["data-structures", "algorithms", "python"],
    weakestTopics: ["Linux permissions", "SQL anti-joins"],
    skillGraph: { algorithms: 88, dataStructures: 86, python: 81, sql: 57, linux: 50 },
    completedTarget: 54,
    accuracyBase: 88,
    badges: ["first-clear", "insane-flame", "bug-slayer"],
    achievements: ["first-blood", "dsa-climber", "seven-day-streak"],
    bossStatus: "ACTIVE",
    planId: "pro"
  },
  {
    email: "bashvector@gencode.dev",
    password: DEMO_USER_PASSWORD,
    username: "bashvector",
    name: "Theo Ramos",
    role: "USER",
    xp: 14330,
    coins: 2460,
    streak: 14,
    pathSlug: "devops-command-line",
    bio: "DevOps learner converting command-line reps into deploy confidence.",
    favoriteCategories: ["bash", "git", "linux"],
    weakestTopics: ["TypeScript types", "system design tradeoffs"],
    skillGraph: { bash: 89, git: 80, linux: 84, typescript: 58, systemDesign: 52 },
    completedTarget: 48,
    accuracyBase: 84,
    badges: ["terminal-rookie", "kernel-monk"],
    achievements: ["first-blood", "git-survivor", "linux-monk"],
    bossStatus: "ACTIVE",
    planId: "starter"
  },
  {
    email: "bughunter7@gencode.dev",
    password: DEMO_USER_PASSWORD,
    username: "bughunter7",
    name: "Sam Rivera",
    role: "USER",
    xp: 13200,
    coins: 2210,
    streak: 11,
    pathSlug: "javascript-debugger",
    bio: "Frontend engineer sharpening debugging discipline and API failure handling.",
    favoriteCategories: ["debugging", "javascript", "apis"],
    weakestTopics: ["C++ memory", "SQL optimization"],
    skillGraph: { debugging: 93, javascript: 82, apis: 79, sql: 54, cpp: 38 },
    completedTarget: 43,
    accuracyBase: 82,
    badges: ["bug-slayer", "first-clear"],
    achievements: ["first-blood", "bug-hunter", "speed-solver"],
    bossStatus: "ACTIVE",
    planId: "starter"
  }
];

const demoFocusSlugs = [
  "sql-easy-duplicate-transactions",
  "linux-easy-permissions-audit",
  "debugging-easy-null-path",
  "security-hard-ssrf-url-filter",
  "java-easy-collections-frequency"
];

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function pickChallengeSlugs(operator: DemoOperator) {
  const preferred = new Set(operator.favoriteCategories);
  const preferredMatches = challengeCatalog.filter((challenge) => preferred.has(challenge.categorySlug));
  const broadMatches = challengeCatalog.filter((challenge) => !preferred.has(challenge.categorySlug));
  return [...preferredMatches, ...broadMatches]
    .sort((a, b) => {
      const difficultyScore: Record<Difficulty, number> = { EASY: 0, MEDIUM: 1, HARD: 2, EXTREME: 3, INSANE: 4 };
      return difficultyScore[a.difficulty] - difficultyScore[b.difficulty] || a.slug.localeCompare(b.slug);
    })
    .slice(0, operator.completedTarget)
    .map((challenge) => challenge.slug);
}

async function upsertQuestProgress(
  prisma: PrismaClient,
  userId: string,
  questSlug: string,
  kind: "daily" | "weekly",
  progress: number,
  goal: number,
  assignedFor: Date
) {
  if (kind === "daily") {
    const quest = await prisma.dailyQuest.findUnique({ where: { slug: questSlug } });
    if (!quest) return;
    const existing = await prisma.userDailyQuest.findFirst({ where: { userId, questId: quest.id, assignedFor } });
    if (existing) {
      await prisma.userDailyQuest.update({
        where: { id: existing.id },
        data: { progress, goal, completedAt: progress >= goal ? assignedFor : null }
      });
      return;
    }
    await prisma.userDailyQuest.create({
      data: { userId, questId: quest.id, progress, goal, completedAt: progress >= goal ? assignedFor : null, assignedFor }
    });
    return;
  }

  const quest = await prisma.weeklyQuest.findUnique({ where: { slug: questSlug } });
  if (!quest) return;
  const existing = await prisma.userWeeklyQuest.findFirst({ where: { userId, questId: quest.id, assignedFor } });
  if (existing) {
    await prisma.userWeeklyQuest.update({
      where: { id: existing.id },
      data: { progress, goal, completedAt: progress >= goal ? assignedFor : null }
    });
    return;
  }
  await prisma.userWeeklyQuest.create({
    data: { userId, questId: quest.id, progress, goal, completedAt: progress >= goal ? assignedFor : null, assignedFor }
  });
}

async function createSeededSubmission(prisma: PrismaClient, userId: string, challengeId: string, slug: string, index: number, accuracyBase: number) {
  const existing = await prisma.submission.findFirst({
    where: { userId, challengeId, submittedCode: { contains: `DEMO_SEED:${slug}` } }
  });
  if (existing) return existing;

  const score = Math.max(62, Math.min(100, accuracyBase - (index % 6) * 4 + (index % 2) * 3));
  const passed = score >= 74;
  const submission = await prisma.submission.create({
    data: {
      userId,
      challengeId,
      submittedCode: `/* DEMO_SEED:${slug} */\n// Investor demo solution transcript for ${slug}.`,
      answer: asJson({ demo: true, slug, reasoning: "Explained constraints, solved visible checks, and reviewed edge cases with Genie." }),
      status: passed ? "PASSED" : "PARTIAL",
      score,
      runtime: 120 + (index % 7) * 34,
      memory: 28 + (index % 5) * 9,
      testResults: asJson([
        { name: "visible scenario", passed: true, message: "Matches expected behavior." },
        { name: "edge scenario", passed, message: passed ? "Handles edge cases cleanly." : "Needs one more edge case pass." }
      ]),
      createdAt: subDays(new Date(), index % 10)
    }
  });

  await prisma.testResult.createMany({
    data: [
      { submissionId: submission.id, name: "visible scenario", passed: true, expected: "accepted", actual: "accepted", runtime: 24 },
      { submissionId: submission.id, name: "edge scenario", passed, expected: "stable output", actual: passed ? "stable output" : "partial output", runtime: 39 }
    ]
  });

  return submission;
}

async function ensureChatSession(prisma: PrismaClient, userId: string, challengeSlug: string) {
  let session = await prisma.chatSession.findFirst({
    where: { userId, title: "Demo mentor run: SQL duplicate payments" }
  });
  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        userId,
        title: "Demo mentor run: SQL duplicate payments",
        mode: "debugging",
        context: asJson({ challengeSlug, demo: true })
      }
    });
  }

  const messageCount = await prisma.chatMessage.count({ where: { sessionId: session.id } });
  if (messageCount === 0) {
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId: session.id,
          role: "USER",
          content: "I grouped duplicate transactions, but my hidden test failed. What should I inspect first?",
          metadata: asJson({ demo: true, mode: "debugging" })
        },
        {
          sessionId: session.id,
          role: "ASSISTANT",
          content: "Check whether your grouping uses the business duplicate key, not only the payment id. Keep the query read-only and add deterministic ordering before submitting.",
          metadata: asJson({ demo: true, guardrail: "hint-not-solution" })
        }
      ]
    });
  }
}

export async function seedDemoShowcase(prisma: PrismaClient) {
  await syncSubscriptionPlans(prisma);
  const categoriesBySlug = new Map((await prisma.category.findMany()).map((category) => [category.slug, category.id]));
  const challengesBySlug = new Map((await prisma.challenge.findMany({ select: { id: true, slug: true, categoryId: true, difficulty: true } })).map((challenge) => [challenge.slug, challenge]));
  const pathBySlug = new Map((await prisma.learningPath.findMany({ select: { id: true, slug: true } })).map((path) => [path.slug, path.id]));
  const bossBySlug = new Map((await prisma.bossBattle.findMany({ select: { id: true, slug: true } })).map((boss) => [boss.slug, boss.id]));

  if (categoriesBySlug.size === 0 || challengesBySlug.size === 0) {
    throw new Error("Base seed data is missing. Run npm run db:seed before npm run db:seed:demo.");
  }

  const today = new Date("2026-04-24T00:00:00.000Z");

  for (const operator of demoOperators) {
    const passwordHash = await bcrypt.hash(operator.password, 12);
    const level = getLevelForXp(operator.xp).level;
    const user = await prisma.user.upsert({
      where: { email: operator.email },
      update: {
        username: operator.username,
        name: operator.name,
        role: operator.role,
        xp: operator.xp,
        level,
        coins: operator.coins,
        streak: operator.streak,
        passwordHash,
        lastActiveAt: addDays(today, 1)
      },
      create: {
        email: operator.email,
        username: operator.username,
        name: operator.name,
        role: operator.role,
        xp: operator.xp,
        level,
        coins: operator.coins,
        streak: operator.streak,
        passwordHash,
        lastActiveAt: addDays(today, 1)
      }
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: operator.bio,
        favoriteCategories: operator.favoriteCategories,
        skillGraph: asJson(operator.skillGraph),
        publicProfile: true
      },
      create: {
        userId: user.id,
        bio: operator.bio,
        favoriteCategories: operator.favoriteCategories,
        skillGraph: asJson(operator.skillGraph),
        publicProfile: true
      }
    });

    await prisma.userSubscription.upsert({
      where: { id: `demo-sub-${operator.username}` },
      update: {
        planId: operator.planId,
        status: operator.planId === "free" ? "ACTIVE" : "ACTIVE",
        billingInterval: operator.planId === "enterprise" ? "CUSTOM" : "YEARLY",
        currentPeriodStart: subDays(today, 12),
        currentPeriodEnd: addDays(today, 353),
        cancelAtPeriodEnd: false,
        stripeCustomerId: operator.planId === "free" ? null : `cus_demo_${operator.username}`,
        stripeSubscriptionId: operator.planId === "free" ? null : `sub_demo_${operator.username}`,
        stripePriceId: operator.planId === "enterprise" ? null : `price_demo_${operator.planId}_yearly`
      },
      create: {
        id: `demo-sub-${operator.username}`,
        userId: user.id,
        planId: operator.planId,
        status: "ACTIVE",
        billingInterval: operator.planId === "enterprise" ? "CUSTOM" : "YEARLY",
        currentPeriodStart: subDays(today, 12),
        currentPeriodEnd: addDays(today, 353),
        cancelAtPeriodEnd: false,
        stripeCustomerId: operator.planId === "free" ? null : `cus_demo_${operator.username}`,
        stripeSubscriptionId: operator.planId === "free" ? null : `sub_demo_${operator.username}`,
        stripePriceId: operator.planId === "enterprise" ? null : `price_demo_${operator.planId}_yearly`
      }
    });

    await prisma.usageCounter.upsert({
      where: { userId_periodKey: { userId: user.id, periodKey: today.toISOString().slice(0, 10) } },
      update: {
        genieMessagesUsed: operator.role === "ADMIN" ? 18 : 7
      },
      create: {
        userId: user.id,
        periodKey: today.toISOString().slice(0, 10),
        genieMessagesUsed: operator.role === "ADMIN" ? 18 : 7
      }
    });
    await prisma.usageCounter.upsert({
      where: { userId_periodKey: { userId: user.id, periodKey: today.toISOString().slice(0, 7) } },
      update: {
        challengesAttempted: operator.completedTarget + 8,
        challengesCompleted: operator.completedTarget,
        vrSessionsUsed: operator.planId === "elite" || operator.planId === "enterprise" ? 3 : 0,
        arenaRunsUsed: operator.planId === "starter" ? 1 : 4,
        bossBattlesAttempted: operator.bossStatus === "COMPLETED" ? 4 : 1
      },
      create: {
        userId: user.id,
        periodKey: today.toISOString().slice(0, 7),
        challengesAttempted: operator.completedTarget + 8,
        challengesCompleted: operator.completedTarget,
        vrSessionsUsed: operator.planId === "elite" || operator.planId === "enterprise" ? 3 : 0,
        arenaRunsUsed: operator.planId === "starter" ? 1 : 4,
        bossBattlesAttempted: operator.bossStatus === "COMPLETED" ? 4 : 1
      }
    });

    await prisma.onboardingProfile.upsert({
      where: { userId: user.id },
      update: {
        experienceLevel: operator.role === "ADMIN" ? "advanced" : "intermediate",
        targetGoal: operator.role === "ADMIN" ? "Demo platform operations and quality review." : "Prepare for backend interviews with SQL, Linux, debugging, and DSA reps.",
        preferredCategories: operator.favoriteCategories,
        weakestTopics: operator.weakestTopics,
        preferredLanguage: operator.favoriteCategories.includes("python") ? "python" : "typescript",
        minutesPerDay: operator.role === "ADMIN" ? 45 : 30,
        preparingFor: operator.role === "ADMIN" ? "platform demo" : "interview",
        recommendedPathSlug: operator.pathSlug
      },
      create: {
        userId: user.id,
        experienceLevel: operator.role === "ADMIN" ? "advanced" : "intermediate",
        targetGoal: operator.role === "ADMIN" ? "Demo platform operations and quality review." : "Prepare for backend interviews with SQL, Linux, debugging, and DSA reps.",
        preferredCategories: operator.favoriteCategories,
        weakestTopics: operator.weakestTopics,
        preferredLanguage: operator.favoriteCategories.includes("python") ? "python" : "typescript",
        minutesPerDay: operator.role === "ADMIN" ? 45 : 30,
        preparingFor: operator.role === "ADMIN" ? "platform demo" : "interview",
        recommendedPathSlug: operator.pathSlug
      }
    });

    const selectedSlugs = Array.from(new Set([...demoFocusSlugs, ...pickChallengeSlugs(operator)])).filter((slug) => challengesBySlug.has(slug));
    for (const [index, slug] of selectedSlugs.entries()) {
      const challenge = challengesBySlug.get(slug);
      if (!challenge) continue;
      const submission = await createSeededSubmission(prisma, user.id, challenge.id, slug, index, operator.accuracyBase);
      const completed = submission.status === "PASSED";
      await prisma.userProgress.upsert({
        where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
        update: {
          status: completed ? "COMPLETED" : "IN_PROGRESS",
          bestScore: submission.score,
          attempts: 1 + (index % 3),
          completedAt: completed ? submission.createdAt : null,
          lastSubmittedAt: submission.createdAt,
          timeSpent: 420 + index * 35
        },
        create: {
          userId: user.id,
          challengeId: challenge.id,
          status: completed ? "COMPLETED" : "IN_PROGRESS",
          bestScore: submission.score,
          attempts: 1 + (index % 3),
          completedAt: completed ? submission.createdAt : null,
          lastSubmittedAt: submission.createdAt,
          timeSpent: 420 + index * 35
        }
      });
    }

    for (const [index, category] of categories.entries()) {
      const categoryId = categoriesBySlug.get(category.slug);
      if (!categoryId) continue;
      const favored = operator.favoriteCategories.includes(category.slug);
      await prisma.categoryProgress.upsert({
        where: { userId_categoryId: { userId: user.id, categoryId } },
        update: {
          xp: Math.max(0, Math.round(operator.xp * (favored ? 0.18 : 0.08) - index * 45)),
          completedChallenges: Math.max(0, Math.round((operator.completedTarget / (favored ? 4 : 12)) - index * 0.12)),
          bestDifficulty: operator.role === "ADMIN" && index % 4 === 0 ? "INSANE" : favored ? "HARD" : index % 3 === 0 ? "MEDIUM" : "EASY",
          accuracy: Math.max(42, operator.accuracyBase - index * 2 + (favored ? 4 : 0)),
          averageAttempts: Number((1.15 + (index % 5) * 0.22).toFixed(2))
        },
        create: {
          userId: user.id,
          categoryId,
          xp: Math.max(0, Math.round(operator.xp * (favored ? 0.18 : 0.08) - index * 45)),
          completedChallenges: Math.max(0, Math.round((operator.completedTarget / (favored ? 4 : 12)) - index * 0.12)),
          bestDifficulty: operator.role === "ADMIN" && index % 4 === 0 ? "INSANE" : favored ? "HARD" : index % 3 === 0 ? "MEDIUM" : "EASY",
          accuracy: Math.max(42, operator.accuracyBase - index * 2 + (favored ? 4 : 0)),
          averageAttempts: Number((1.15 + (index % 5) * 0.22).toFixed(2))
        }
      });
    }

    for (const slug of operator.badges) {
      const badge = await prisma.badge.findUnique({ where: { slug } });
      if (!badge) continue;
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
        update: {},
        create: { userId: user.id, badgeId: badge.id, earnedAt: subDays(today, operator.badges.indexOf(slug)) }
      });
    }

    for (const slug of operator.achievements) {
      const achievement = await prisma.achievement.findUnique({ where: { slug } });
      if (!achievement) continue;
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId: user.id, achievementId: achievement.id } },
        update: {},
        create: { userId: user.id, achievementId: achievement.id, unlockedAt: subDays(today, operator.achievements.indexOf(slug) + 1) }
      });
    }

    const pathId = pathBySlug.get(operator.pathSlug) ?? pathBySlug.get(learningPaths[0]?.slug ?? "");
    if (pathId) {
      await prisma.userLearningPathProgress.upsert({
        where: { userId_learningPathId: { userId: user.id, learningPathId: pathId } },
        update: {
          status: operator.role === "ADMIN" ? "COMPLETED" : "ACTIVE",
          completedChallenges: Math.min(operator.completedTarget, operator.role === "ADMIN" ? 14 : 7),
          completedAt: operator.role === "ADMIN" ? subDays(today, 2) : null
        },
        create: {
          userId: user.id,
          learningPathId: pathId,
          status: operator.role === "ADMIN" ? "COMPLETED" : "ACTIVE",
          completedChallenges: Math.min(operator.completedTarget, operator.role === "ADMIN" ? 14 : 7),
          completedAt: operator.role === "ADMIN" ? subDays(today, 2) : null
        }
      });
    }

    for (const boss of bossBattles.slice(0, operator.role === "ADMIN" ? 5 : 3)) {
      const bossId = bossBySlug.get(boss.slug);
      if (!bossId) continue;
      await prisma.userBossBattleProgress.upsert({
        where: { userId_bossBattleId: { userId: user.id, bossBattleId: bossId } },
        update: {
          status: operator.bossStatus,
          currentStage: operator.bossStatus === "COMPLETED" ? boss.stages.length : 1,
          bestScore: operator.bossStatus === "LOCKED" ? 0 : operator.role === "ADMIN" ? 91 : 76,
          completedAt: operator.bossStatus === "COMPLETED" ? subDays(today, 3) : null
        },
        create: {
          userId: user.id,
          bossBattleId: bossId,
          status: operator.bossStatus,
          currentStage: operator.bossStatus === "COMPLETED" ? boss.stages.length : 1,
          bestScore: operator.bossStatus === "LOCKED" ? 0 : operator.role === "ADMIN" ? 91 : 76,
          completedAt: operator.bossStatus === "COMPLETED" ? subDays(today, 3) : null
        }
      });
    }

    await upsertQuestProgress(prisma, user.id, "daily-three-easy", "daily", operator.role === "ADMIN" ? 3 : 2, 3, today);
    await upsertQuestProgress(prisma, user.id, "daily-one-sql", "daily", operator.favoriteCategories.includes("sql") ? 1 : 0, 1, today);
    await upsertQuestProgress(prisma, user.id, "daily-one-linux", "daily", operator.favoriteCategories.includes("linux") ? 1 : 0, 1, today);
    await upsertQuestProgress(prisma, user.id, "weekly-hard-clear", "weekly", operator.role === "ADMIN" ? 3 : 1, 3, today);
    await upsertQuestProgress(prisma, user.id, "weekly-category-sprint", "weekly", operator.role === "ADMIN" ? 8 : 5, 8, today);

    for (const [index, item] of shopItems.slice(0, operator.role === "ADMIN" ? 5 : 3).entries()) {
      const shopItem = await prisma.shopItem.findUnique({ where: { slug: item.slug } });
      if (!shopItem) continue;
      await prisma.userInventory.upsert({
        where: { userId_shopItemId: { userId: user.id, shopItemId: shopItem.id } },
        update: {},
        create: { userId: user.id, shopItemId: shopItem.id, purchasedAt: subDays(today, index) }
      });
      if (index === 0) {
        await prisma.userEquippedCosmetic.upsert({
          where: { userId_slot: { userId: user.id, slot: item.type } },
          update: { shopItemId: shopItem.id },
          create: { userId: user.id, shopItemId: shopItem.id, slot: item.type }
        });
      }
    }

    const duplicateChallenge = challengesBySlug.get("sql-easy-duplicate-transactions");
    if (duplicateChallenge) {
      await prisma.challengeHintUsage.upsert({
        where: { userId_challengeId_hintIndex: { userId: user.id, challengeId: duplicateChallenge.id, hintIndex: 0 } },
        update: {},
        create: { userId: user.id, challengeId: duplicateChallenge.id, hintIndex: 0, usedAt: subDays(today, 1) }
      });
      await ensureChatSession(prisma, user.id, "sql-easy-duplicate-transactions");
      const existingVr = await prisma.vRSession.findFirst({ where: { userId: user.id, challengeId: duplicateChallenge.id, mode: "fallback-3d" } });
      if (!existingVr) {
        await prisma.vRSession.create({
          data: {
            userId: user.id,
            challengeId: duplicateChallenge.id,
            mode: "fallback-3d",
            voiceEnabled: true,
            startedAt: subDays(today, 1),
            endedAt: subDays(today, 1),
            metadata: asJson({ demo: true, room: "browser immersive", command: "Genie, explain this error" })
          }
        });
      }
    }

    const existingArena = await prisma.arenaRun.findFirst({ where: { userId: user.id, modeSlug: "mixed-gauntlet", metadata: { path: ["demo"], equals: true } } });
    if (!existingArena) {
      await prisma.arenaRun.create({
        data: {
          userId: user.id,
          modeSlug: "mixed-gauntlet",
          status: "COMPLETED",
          challengeSlugs: selectedSlugs.slice(0, 5),
          score: Math.round(operator.xp / 22),
          accuracy: operator.accuracyBase,
          speedBonus: operator.role === "ADMIN" ? 140 : 85,
          noHintBonus: operator.role === "ADMIN" ? 130 : 70,
          correct: 4,
          attempted: 5,
          secondsRemaining: operator.role === "ADMIN" ? 240 : 95,
          hintsUsed: operator.role === "ADMIN" ? 0 : 1,
          endedAt: subDays(today, 1),
          metadata: asJson({ demo: true, modeName: "Investor Demo Mixed Gauntlet" })
        }
      });
    }

    if (operator.role === "ADMIN") {
      const existingAudit = await prisma.adminAuditLog.findFirst({ where: { actorId: user.id, action: "DEMO_CONTENT_REVIEW" } });
      if (!existingAudit) {
        await prisma.adminAuditLog.createMany({
          data: [
            { actorId: user.id, action: "DEMO_CONTENT_REVIEW", target: "challenge", metadata: asJson({ queue: "high-failure missions", demo: true }) },
            { actorId: user.id, action: "DEMO_AI_GUARDRAIL_CHECK", target: "assistant", metadata: asJson({ provider: "mock", leakageRisk: "low", demo: true }) }
          ]
        });
      }
    }
  }

  const admin = await prisma.user.findUnique({ where: { email: DEMO_ADMIN_EMAIL } });
  const demoUser = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (admin && demoUser) {
    const team = await prisma.team.upsert({
      where: { stripeSubscriptionId: "sub_demo_gencode_bootcamp" },
      update: {
        name: "Gencode Demo Cohort",
        ownerId: admin.id,
        planId: "team",
        stripeCustomerId: "cus_demo_gencode_bootcamp",
        seatLimit: 12
      },
      create: {
        name: "Gencode Demo Cohort",
        ownerId: admin.id,
        planId: "team",
        stripeCustomerId: "cus_demo_gencode_bootcamp",
        stripeSubscriptionId: "sub_demo_gencode_bootcamp",
        seatLimit: 12
      }
    });
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: admin.id } },
      update: { role: "OWNER" },
      create: { teamId: team.id, userId: admin.id, role: "OWNER" }
    });
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: demoUser.id } },
      update: { role: "MEMBER" },
      create: { teamId: team.id, userId: demoUser.id, role: "MEMBER" }
    });
    const existingLead = await prisma.salesLead.findFirst({ where: { email: "ops@northstarbootcamp.dev" } });
    if (!existingLead) {
      await prisma.salesLead.create({
        data: {
          name: "Priya Raman",
          email: "ops@northstarbootcamp.dev",
          organization: "Northstar Bootcamp",
          teamSize: 42,
          useCase: "bootcamp",
          message: "We want SQL, Linux, debugging, and DSA paths with cohort analytics and weekly boss battle events.",
          source: "demo-seed",
          status: "QUALIFIED"
        }
      });
    }
  }

  console.log(`Demo showcase seeded: ${demoOperators.length} operators, local credentials, progress, submissions, quests, chat, VR sessions, shop inventory, and admin telemetry.`);
  console.log(`Demo user: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
  console.log(`Demo admin: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
}
