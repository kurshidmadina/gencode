import bcrypt from "bcryptjs";
import nextEnv from "@next/env";
import { Prisma, PrismaClient } from "@prisma/client";
import { categories } from "../src/lib/game/types";
import { challengeCatalog } from "../src/lib/game/challenge-data";
import { getLevelForXp } from "../src/lib/game/progression";
import { learningPaths } from "../src/lib/game/learning-paths";
import { bossBattles } from "../src/lib/game/boss-battles";
import { platformQuests } from "../src/lib/game/platform-quests";
import { shopItems } from "../src/lib/game/shop";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_USER_EMAIL, DEMO_USER_PASSWORD, seedDemoShowcase } from "./demo-showcase";

nextEnv.loadEnvConfig(process.cwd());

const prisma = new PrismaClient();

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

const achievements = [
  {
    slug: "first-blood",
    name: "First Blood",
    description: "Complete your first challenge.",
    criteria: { completedChallenges: 1 },
    xpReward: 50,
    coinReward: 10
  },
  {
    slug: "sql-starter",
    name: "SQL Starter",
    description: "Complete 5 SQL challenges.",
    criteria: { category: "sql", completedChallenges: 5 },
    xpReward: 120,
    coinReward: 25
  },
  {
    slug: "query-knight",
    name: "Query Knight",
    description: "Complete 25 SQL challenges.",
    criteria: { category: "sql", completedChallenges: 25 },
    xpReward: 300,
    coinReward: 75
  },
  {
    slug: "linux-monk",
    name: "Linux Monk",
    description: "Complete 10 Linux challenges.",
    criteria: { category: "linux", completedChallenges: 10 },
    xpReward: 180,
    coinReward: 35
  },
  {
    slug: "dsa-climber",
    name: "DSA Climber",
    description: "Complete 20 data structure and algorithm challenges.",
    criteria: { categories: ["data-structures", "algorithms"], completedChallenges: 20 },
    xpReward: 240,
    coinReward: 50
  },
  {
    slug: "insane-survivor",
    name: "Insane Survivor",
    description: "Complete one Insane challenge.",
    criteria: { difficulty: "INSANE", completedChallenges: 1 },
    xpReward: 400,
    coinReward: 100
  },
  {
    slug: "seven-day-streak",
    name: "7-Day Streak",
    description: "Train for seven consecutive days.",
    criteria: { streak: 7 },
    xpReward: 150,
    coinReward: 30
  },
  {
    slug: "thirty-day-streak",
    name: "30-Day Streak",
    description: "Train for thirty consecutive days.",
    criteria: { streak: 30 },
    xpReward: 500,
    coinReward: 150
  },
  {
    slug: "bug-hunter",
    name: "Bug Hunter",
    description: "Complete 10 debugging challenges.",
    criteria: { type: "DEBUGGING", completedChallenges: 10 },
    xpReward: 160,
    coinReward: 40
  },
  {
    slug: "debug-hunter",
    name: "Debug Hunter",
    description: "Complete 10 debugging challenges.",
    criteria: { type: "DEBUGGING", completedChallenges: 10 },
    xpReward: 180,
    coinReward: 45
  },
  {
    slug: "git-survivor",
    name: "Git Survivor",
    description: "Complete 10 Git workflow challenges.",
    criteria: { category: "git", completedChallenges: 10 },
    xpReward: 180,
    coinReward: 45
  },
  {
    slug: "speed-solver",
    name: "Speed Solver",
    description: "Complete a challenge under the target time.",
    criteria: { underEstimatedTime: true },
    xpReward: 100,
    coinReward: 30
  },
  {
    slug: "no-hint-hero",
    name: "No Hint Hero",
    description: "Complete a challenge without using hints.",
    criteria: { hintsUsed: 0 },
    xpReward: 120,
    coinReward: 35
  },
  {
    slug: "gencode-legend",
    name: "Gencode Legend",
    description: "Reach legendary platform mastery.",
    criteria: { level: 44 },
    xpReward: 1000,
    coinReward: 300
  }
];

const badges = [
  { slug: "founder", name: "Founder", description: "Joined the early Gencode arena.", icon: "crown", rarity: "legendary" },
  { slug: "first-clear", name: "First Clear", description: "Completed the first mission.", icon: "spark", rarity: "common" },
  { slug: "query-knight", name: "Query Knight", description: "Won a SQL ladder run.", icon: "database", rarity: "rare" },
  { slug: "terminal-rookie", name: "Terminal Rookie", description: "Survived the shell warmup.", icon: "terminal", rarity: "common" },
  { slug: "insane-flame", name: "Insane Flame", description: "Cleared an Insane mission.", icon: "flame", rarity: "epic" },
  { slug: "kernel-monk", name: "Kernel Monk", description: "Finished the Linux survival path or defeated its boss.", icon: "terminal", rarity: "epic" },
  { slug: "backend-sentinel", name: "Backend Sentinel", description: "Cleared backend API pressure rooms.", icon: "webhook", rarity: "epic" },
  { slug: "bug-slayer", name: "Bug Slayer", description: "Won a full-stack debugging boss fight.", icon: "bug", rarity: "rare" },
  { slug: "insane-architect", name: "Insane Architect", description: "Entered the late-game algorithm realm.", icon: "brain", rarity: "legendary" }
];

const quests = [
  {
    slug: "daily-three-easy",
    title: "Complete 3 Easy challenges",
    description: "Clear three Easy missions in any category.",
    cadence: "DAILY" as const,
    xpReward: 120,
    coinReward: 30,
    criteria: { difficulty: "EASY", count: 3 }
  },
  {
    slug: "daily-one-sql",
    title: "Solve 1 SQL challenge",
    description: "Clear a SQL mission.",
    cadence: "DAILY" as const,
    xpReward: 100,
    coinReward: 25,
    criteria: { category: "sql", count: 1 }
  },
  {
    slug: "daily-one-linux",
    title: "Solve 1 Linux challenge",
    description: "Clear a Linux mission.",
    cadence: "DAILY" as const,
    xpReward: 100,
    coinReward: 25,
    criteria: { category: "linux", count: 1 }
  },
  {
    slug: "daily-no-hints",
    title: "Complete a challenge without hints",
    description: "Clear any mission without opening a hint.",
    cadence: "DAILY" as const,
    xpReward: 140,
    coinReward: 35,
    criteria: { hintsUsed: 0, count: 1 }
  },
  {
    slug: "weekly-streak-hold",
    title: "Maintain streak",
    description: "Keep the weekly training chain alive.",
    cadence: "WEEKLY" as const,
    xpReward: 300,
    coinReward: 90,
    criteria: { streakMaintained: true }
  }
];

const weeklyQuests = [
  {
    slug: "weekly-hard-clear",
    title: "Clear 3 Hard missions",
    description: "Win three Hard or higher missions this week.",
    cadence: "WEEKLY" as const,
    xpReward: 450,
    coinReward: 120,
    criteria: { minDifficulty: "HARD", count: 3 }
  },
  {
    slug: "weekly-category-sprint",
    title: "Complete 8 missions in one category",
    description: "Focus one skill track long enough to build real momentum.",
    cadence: "WEEKLY" as const,
    xpReward: 500,
    coinReward: 140,
    criteria: { sameCategoryCount: 8 }
  },
  {
    slug: "weekly-no-hint-chain",
    title: "Complete 5 no-hint missions",
    description: "Finish five challenges without opening a hint.",
    cadence: "WEEKLY" as const,
    xpReward: 600,
    coinReward: 180,
    criteria: { hintsUsed: 0, count: 5 }
  }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);

  const categoryRecords = new Map<string, string>();
  for (const [order, category] of categories.entries()) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        order
      },
      create: {
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        color: category.color,
        description: category.description,
        order
      }
    });
    categoryRecords.set(category.slug, record.id);
  }

  const generatedChallenges = challengeCatalog;
  const challengeRecords = new Map<string, string>();
  for (const challenge of generatedChallenges) {
    const categoryId = categoryRecords.get(challenge.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${challenge.categorySlug}`);
    const record = await prisma.challenge.upsert({
      where: { slug: challenge.slug },
      update: {
        title: challenge.title,
        subtitle: challenge.subtitle,
        description: challenge.description,
        story: challenge.story,
        learningObjective: challenge.learningObjective,
        instructions: challenge.instructions,
        categoryId,
        difficulty: challenge.difficulty,
        type: challenge.type,
        status: challenge.status,
        tags: challenge.tags,
        prerequisites: challenge.prerequisites,
        xpReward: challenge.xpReward,
        coinReward: challenge.coinReward,
        starterCode: challenge.starterCode,
        language: challenge.language,
        testCases: asJson(challenge.testCases),
        hiddenTestCases: asJson(challenge.hiddenTestCases),
        validationMetadata: asJson(challenge.validationMetadata),
        examples: asJson(challenge.examples),
        hints: challenge.hints,
        solution: challenge.solution,
        explanation: challenge.explanation,
        successCriteria: asJson(challenge.successCriteria),
        relatedChallenges: challenge.relatedChallenges,
        estimatedTime: challenge.estimatedTime,
        unlockRules: asJson(challenge.unlockRules),
        featured: challenge.featured ?? false
      },
      create: {
        slug: challenge.slug,
        title: challenge.title,
        subtitle: challenge.subtitle,
        description: challenge.description,
        story: challenge.story,
        learningObjective: challenge.learningObjective,
        instructions: challenge.instructions,
        categoryId,
        difficulty: challenge.difficulty,
        type: challenge.type,
        status: challenge.status,
        tags: challenge.tags,
        prerequisites: challenge.prerequisites,
        xpReward: challenge.xpReward,
        coinReward: challenge.coinReward,
        starterCode: challenge.starterCode,
        language: challenge.language,
        testCases: asJson(challenge.testCases),
        hiddenTestCases: asJson(challenge.hiddenTestCases),
        validationMetadata: asJson(challenge.validationMetadata),
        examples: asJson(challenge.examples),
        hints: challenge.hints,
        solution: challenge.solution,
        explanation: challenge.explanation,
        successCriteria: asJson(challenge.successCriteria),
        relatedChallenges: challenge.relatedChallenges,
        estimatedTime: challenge.estimatedTime,
        unlockRules: asJson(challenge.unlockRules),
        featured: challenge.featured ?? false
      }
    });
    challengeRecords.set(challenge.slug, record.id);
  }

  for (const challenge of generatedChallenges) {
    const challengeId = challengeRecords.get(challenge.slug);
    if (!challengeId) continue;
    for (const [order, prerequisiteSlug] of challenge.prerequisites.entries()) {
      const prerequisiteId = challengeRecords.get(prerequisiteSlug);
      if (!prerequisiteId) continue;
      await prisma.challengePrerequisite.upsert({
        where: { challengeId_prerequisiteId: { challengeId, prerequisiteId } },
        update: { required: true, order },
        create: { challengeId, prerequisiteId, required: true, order }
      });
    }
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement
    });
  }

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge
    });
  }

  for (const quest of quests) {
    await prisma.dailyQuest.upsert({
      where: { slug: quest.slug },
      update: quest,
      create: quest
    });
  }

  for (const quest of weeklyQuests) {
    await prisma.weeklyQuest.upsert({
      where: { slug: quest.slug },
      update: quest,
      create: quest
    });
  }

  for (const quest of platformQuests) {
    await prisma.quest.upsert({
      where: { slug: quest.slug },
      update: {
        title: quest.title,
        description: quest.description,
        type: quest.type,
        cadence: quest.cadence ?? null,
        xpReward: quest.xpReward,
        coinReward: quest.coinReward,
        criteria: asJson({ ...quest.criteria, goal: quest.goal }),
        active: true
      },
      create: {
        slug: quest.slug,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        cadence: quest.cadence ?? null,
        xpReward: quest.xpReward,
        coinReward: quest.coinReward,
        criteria: asJson({ ...quest.criteria, goal: quest.goal }),
        active: true
      }
    });
  }

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        metadata: asJson(item.metadata),
        active: true
      },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        price: item.price,
        metadata: asJson(item.metadata),
        active: true
      }
    });
  }

  const learningPathRecords = new Map<string, string>();
  for (const path of learningPaths) {
    const record = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      update: {
        name: path.name,
        description: path.description,
        targetAudience: path.targetAudience,
        estimatedHours: path.estimatedHours,
        badgeReward: path.badgeReward,
        finalBossSlug: path.finalBossSlug,
        milestones: asJson(path.milestones),
        active: true
      },
      create: {
        slug: path.slug,
        name: path.name,
        description: path.description,
        targetAudience: path.targetAudience,
        estimatedHours: path.estimatedHours,
        badgeReward: path.badgeReward,
        finalBossSlug: path.finalBossSlug,
        milestones: asJson(path.milestones),
        active: true
      }
    });
    learningPathRecords.set(path.slug, record.id);
    await prisma.learningPathChallenge.deleteMany({ where: { learningPathId: record.id } });
    for (const [order, challengeSlug] of path.challengeSlugs.entries()) {
      const challengeId = challengeRecords.get(challengeSlug);
      if (!challengeId) {
        console.warn(`Learning path ${path.slug} references missing challenge ${challengeSlug}`);
        continue;
      }
      await prisma.learningPathChallenge.create({
        data: {
          learningPathId: record.id,
          challengeId,
          order,
          milestone: path.milestones.find((milestone) => order + 1 <= milestone.requiredClears)?.title
        }
      });
    }
  }

  const bossRecords = new Map<string, string>();
  for (const boss of bossBattles) {
    const record = await prisma.bossBattle.upsert({
      where: { slug: boss.slug },
      update: {
        name: boss.name,
        description: boss.description,
        story: boss.story,
        categorySlug: boss.categorySlug,
        difficulty: boss.difficulty,
        xpReward: boss.xpReward,
        coinReward: boss.coinReward,
        badgeReward: boss.badgeReward,
        estimatedTime: boss.estimatedTime,
        unlockRules: asJson(boss.unlockRules),
        active: true
      },
      create: {
        slug: boss.slug,
        name: boss.name,
        description: boss.description,
        story: boss.story,
        categorySlug: boss.categorySlug,
        difficulty: boss.difficulty,
        xpReward: boss.xpReward,
        coinReward: boss.coinReward,
        badgeReward: boss.badgeReward,
        estimatedTime: boss.estimatedTime,
        unlockRules: asJson(boss.unlockRules),
        active: true
      }
    });
    bossRecords.set(boss.slug, record.id);
    await prisma.bossBattleStage.deleteMany({ where: { bossBattleId: record.id } });
    for (const [order, stage] of boss.stages.entries()) {
      await prisma.bossBattleStage.create({
        data: {
          bossBattleId: record.id,
          challengeId: stage.challengeSlug ? (challengeRecords.get(stage.challengeSlug) ?? null) : null,
          order,
          title: stage.title,
          instructions: stage.instructions,
          validation: asJson(stage.validation)
        }
      });
    }
  }

  const demoUsers = [
    {
      email: "admin@gencode.dev",
      username: "arena_admin",
      name: "Ari Patel",
      role: "ADMIN" as const,
      xp: 21840,
      coins: 4200,
      streak: 31
    },
    {
      email: DEMO_USER_EMAIL,
      username: "nova_cli",
      name: "Maya Chen",
      role: "USER" as const,
      xp: 7420,
      coins: 1280,
      streak: 9
    }
  ];

  for (const user of demoUsers) {
    const level = getLevelForXp(user.xp).level;
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level,
        coins: user.coins,
        streak: user.streak,
        passwordHash
      },
      create: {
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level,
        coins: user.coins,
        streak: user.streak,
        passwordHash,
        profile: {
          create: {
            bio: "Training inside Gencode.",
            favoriteCategories: ["linux", "sql", "algorithms"],
            skillGraph: {
              linux: 72,
              sql: 66,
              algorithms: 58,
              debugging: 81
            }
          }
        }
      }
    });

    const founder = await prisma.badge.findUnique({ where: { slug: "founder" } });
    if (founder) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: record.id, badgeId: founder.id } },
        update: {},
        create: { userId: record.id, badgeId: founder.id }
      });
    }

    await prisma.onboardingProfile.upsert({
      where: { userId: record.id },
      update: {
        experienceLevel: user.role === "ADMIN" ? "advanced" : "intermediate",
        targetGoal: "Train real technical skills through the Gencode arena.",
        preferredCategories: ["linux", "sql", "algorithms"],
        weakestTopics: ["graph traversal", "SQL windows", "DevOps incidents"],
        preferredLanguage: "typescript",
        minutesPerDay: 35,
        preparingFor: "interview",
        recommendedPathSlug: user.role === "ADMIN" ? "gencode-legend" : "linux-survival"
      },
      create: {
        userId: record.id,
        experienceLevel: user.role === "ADMIN" ? "advanced" : "intermediate",
        targetGoal: "Train real technical skills through the Gencode arena.",
        preferredCategories: ["linux", "sql", "algorithms"],
        weakestTopics: ["graph traversal", "SQL windows", "DevOps incidents"],
        preferredLanguage: "typescript",
        minutesPerDay: 35,
        preparingFor: "interview",
        recommendedPathSlug: user.role === "ADMIN" ? "gencode-legend" : "linux-survival"
      }
    });

    const demoPathId = learningPathRecords.get(user.role === "ADMIN" ? "gencode-legend" : "linux-survival");
    if (demoPathId) {
      await prisma.userLearningPathProgress.upsert({
        where: { userId_learningPathId: { userId: record.id, learningPathId: demoPathId } },
        update: {
          status: "ACTIVE",
          completedChallenges: user.role === "ADMIN" ? 5 : 2
        },
        create: {
          userId: record.id,
          learningPathId: demoPathId,
          status: "ACTIVE",
          completedChallenges: user.role === "ADMIN" ? 5 : 2
        }
      });
    }

    for (const [index, item] of shopItems.slice(0, user.role === "ADMIN" ? 3 : 1).entries()) {
      const shopItem = await prisma.shopItem.findUnique({ where: { slug: item.slug } });
      if (!shopItem) continue;
      await prisma.userInventory.upsert({
        where: { userId_shopItemId: { userId: record.id, shopItemId: shopItem.id } },
        update: {},
        create: { userId: record.id, shopItemId: shopItem.id }
      });
      if (index === 0) {
        await prisma.userEquippedCosmetic.upsert({
          where: { userId_slot: { userId: record.id, slot: item.type } },
          update: { shopItemId: shopItem.id },
          create: { userId: record.id, shopItemId: shopItem.id, slot: item.type }
        });
      }
    }

    for (const boss of bossBattles.slice(0, 3)) {
      const bossId = bossRecords.get(boss.slug);
      if (!bossId) continue;
      await prisma.userBossBattleProgress.upsert({
        where: { userId_bossBattleId: { userId: record.id, bossBattleId: bossId } },
        update: {
          status: user.role === "ADMIN" ? "ACTIVE" : "LOCKED",
          currentStage: user.role === "ADMIN" ? 1 : 0,
          bestScore: user.role === "ADMIN" ? 72 : 0
        },
        create: {
          userId: record.id,
          bossBattleId: bossId,
          status: user.role === "ADMIN" ? "ACTIVE" : "LOCKED",
          currentStage: user.role === "ADMIN" ? 1 : 0,
          bestScore: user.role === "ADMIN" ? 72 : 0
        }
      });
    }

    await prisma.arenaRun.deleteMany({
      where: { userId: record.id, modeSlug: { in: ["mixed-gauntlet", "sql-sprint-10"] } }
    });
    await prisma.arenaRun.createMany({
      data: [
        {
          userId: record.id,
          modeSlug: "mixed-gauntlet",
          status: "COMPLETED",
          challengeSlugs: ["linux-easy-permissions-audit", "sql-easy-duplicate-transactions", "algorithms-easy-first-bad-build"],
          score: user.role === "ADMIN" ? 910 : 760,
          accuracy: user.role === "ADMIN" ? 92 : 78,
          speedBonus: user.role === "ADMIN" ? 120 : 80,
          noHintBonus: user.role === "ADMIN" ? 120 : 60,
          correct: user.role === "ADMIN" ? 5 : 4,
          attempted: 5,
          secondsRemaining: user.role === "ADMIN" ? 220 : 95,
          hintsUsed: user.role === "ADMIN" ? 0 : 1,
          endedAt: new Date(),
          metadata: asJson({ seeded: true, modeName: "Mixed Technical Gauntlet" })
        },
        {
          userId: record.id,
          modeSlug: "sql-sprint-10",
          status: "COMPLETED",
          challengeSlugs: ["sql-easy-duplicate-transactions", "sql-easy-window-ranking"],
          score: user.role === "ADMIN" ? 840 : 690,
          accuracy: user.role === "ADMIN" ? 90 : 72,
          speedBonus: user.role === "ADMIN" ? 110 : 55,
          noHintBonus: 80,
          correct: user.role === "ADMIN" ? 4 : 3,
          attempted: 4,
          secondsRemaining: user.role === "ADMIN" ? 180 : 60,
          hintsUsed: 0,
          endedAt: new Date(),
          metadata: asJson({ seeded: true, modeName: "10-minute SQL Sprint" })
        }
      ]
    });

    await prisma.bossBattleStageAttempt.deleteMany({ where: { userId: record.id } });
    for (const boss of bossBattles.slice(0, user.role === "ADMIN" ? 2 : 1)) {
      const bossId = bossRecords.get(boss.slug);
      if (!bossId) continue;
      const stageRecord = await prisma.bossBattleStage.findFirst({
        where: { bossBattleId: bossId },
        orderBy: { order: "asc" }
      });
      await prisma.bossBattleStageAttempt.create({
        data: {
          userId: record.id,
          bossBattleId: bossId,
          stageId: stageRecord?.id ?? null,
          stageIndex: 0,
          status: user.role === "ADMIN" ? "STAGE_CLEARED" : "STARTED",
          score: user.role === "ADMIN" ? 82 : 0,
          notes: "Seeded boss progress signal for local analytics.",
          metadata: asJson({ seeded: true, bossSlug: boss.slug })
        }
      });
    }

    for (const [index, category] of categories.entries()) {
      const categoryId = categoryRecords.get(category.slug);
      if (!categoryId) continue;
      await prisma.categoryProgress.upsert({
        where: { userId_categoryId: { userId: record.id, categoryId } },
        update: {
          xp: Math.max(0, user.xp - index * 110),
          completedChallenges: Math.max(0, Math.floor((user.xp / 900) - index / 3)),
          bestDifficulty: index % 5 === 0 ? "HARD" : index % 3 === 0 ? "MEDIUM" : "EASY",
          accuracy: Math.max(45, 92 - index * 2),
          averageAttempts: 1.2 + (index % 5) * 0.35
        },
        create: {
          userId: record.id,
          categoryId,
          xp: Math.max(0, user.xp - index * 110),
          completedChallenges: Math.max(0, Math.floor((user.xp / 900) - index / 3)),
          bestDifficulty: index % 5 === 0 ? "HARD" : index % 3 === 0 ? "MEDIUM" : "EASY",
          accuracy: Math.max(45, 92 - index * 2),
          averageAttempts: 1.2 + (index % 5) * 0.35
        }
      });
    }
  }

  await seedDemoShowcase(prisma);

  console.log(`Seeded ${categories.length} categories, ${generatedChallenges.length} challenges, ${learningPaths.length} paths, ${bossBattles.length} bosses, and ${shopItems.length} shop items.`);
  console.log(`Demo user: ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
  console.log(`Demo admin: ${DEMO_ADMIN_EMAIL} / ${DEMO_ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
