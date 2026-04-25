-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ChallengeType" ADD VALUE 'FILL_IN_CODE';
ALTER TYPE "ChallengeType" ADD VALUE 'OUTPUT_PREDICTION';
ALTER TYPE "ChallengeType" ADD VALUE 'SECURITY_DEBUGGING';
ALTER TYPE "ChallengeType" ADD VALUE 'SYSTEM_DESIGN_MINI';
ALTER TYPE "ChallengeType" ADD VALUE 'BOSS_STAGE';

-- CreateTable
CREATE TABLE "OnboardingProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "targetGoal" TEXT NOT NULL,
    "preferredCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weakestTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredLanguage" TEXT NOT NULL,
    "minutesPerDay" INTEGER NOT NULL,
    "preparingFor" TEXT NOT NULL,
    "recommendedPathSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetAudience" TEXT NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "badgeReward" TEXT NOT NULL,
    "finalBossSlug" TEXT,
    "milestones" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathChallenge" (
    "id" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "milestone" TEXT,

    CONSTRAINT "LearningPathChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLearningPathProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completedChallenges" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLearningPathProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossBattle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL,
    "badgeReward" TEXT NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "unlockRules" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BossBattle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossBattleStage" (
    "id" TEXT NOT NULL,
    "bossBattleId" TEXT NOT NULL,
    "challengeId" TEXT,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "validation" JSONB NOT NULL,

    CONSTRAINT "BossBattleStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBossBattleProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bossBattleId" TEXT NOT NULL,
    "currentStage" INTEGER NOT NULL DEFAULT 0,
    "bestScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBossBattleProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cadence" "QuestCadence",
    "xpReward" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuestProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInventory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEquippedCosmetic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopItemId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "equippedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEquippedCosmetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "submissionId" TEXT,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProfile_userId_key" ON "OnboardingProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_slug_key" ON "LearningPath"("slug");

-- CreateIndex
CREATE INDEX "LearningPathChallenge_learningPathId_idx" ON "LearningPathChallenge"("learningPathId");

-- CreateIndex
CREATE INDEX "LearningPathChallenge_challengeId_idx" ON "LearningPathChallenge"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPathChallenge_learningPathId_challengeId_key" ON "LearningPathChallenge"("learningPathId", "challengeId");

-- CreateIndex
CREATE INDEX "UserLearningPathProgress_userId_idx" ON "UserLearningPathProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLearningPathProgress_userId_learningPathId_key" ON "UserLearningPathProgress"("userId", "learningPathId");

-- CreateIndex
CREATE UNIQUE INDEX "BossBattle_slug_key" ON "BossBattle"("slug");

-- CreateIndex
CREATE INDEX "BossBattleStage_bossBattleId_idx" ON "BossBattleStage"("bossBattleId");

-- CreateIndex
CREATE INDEX "BossBattleStage_challengeId_idx" ON "BossBattleStage"("challengeId");

-- CreateIndex
CREATE INDEX "UserBossBattleProgress_userId_idx" ON "UserBossBattleProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBossBattleProgress_userId_bossBattleId_key" ON "UserBossBattleProgress"("userId", "bossBattleId");

-- CreateIndex
CREATE UNIQUE INDEX "Quest_slug_key" ON "Quest"("slug");

-- CreateIndex
CREATE INDEX "UserQuestProgress_userId_idx" ON "UserQuestProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestProgress_userId_questId_key" ON "UserQuestProgress"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopItem_slug_key" ON "ShopItem"("slug");

-- CreateIndex
CREATE INDEX "UserInventory_userId_idx" ON "UserInventory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserInventory_userId_shopItemId_key" ON "UserInventory"("userId", "shopItemId");

-- CreateIndex
CREATE INDEX "UserEquippedCosmetic_userId_idx" ON "UserEquippedCosmetic"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEquippedCosmetic_userId_slot_key" ON "UserEquippedCosmetic"("userId", "slot");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_userId_idx" ON "SubmissionAuditLog"("userId");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_submissionId_idx" ON "SubmissionAuditLog"("submissionId");

-- CreateIndex
CREATE INDEX "SubmissionAuditLog_createdAt_idx" ON "SubmissionAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "OnboardingProfile" ADD CONSTRAINT "OnboardingProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathChallenge" ADD CONSTRAINT "LearningPathChallenge_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathChallenge" ADD CONSTRAINT "LearningPathChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningPathProgress" ADD CONSTRAINT "UserLearningPathProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningPathProgress" ADD CONSTRAINT "UserLearningPathProgress_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossBattleStage" ADD CONSTRAINT "BossBattleStage_bossBattleId_fkey" FOREIGN KEY ("bossBattleId") REFERENCES "BossBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossBattleStage" ADD CONSTRAINT "BossBattleStage_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBossBattleProgress" ADD CONSTRAINT "UserBossBattleProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBossBattleProgress" ADD CONSTRAINT "UserBossBattleProgress_bossBattleId_fkey" FOREIGN KEY ("bossBattleId") REFERENCES "BossBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInventory" ADD CONSTRAINT "UserInventory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInventory" ADD CONSTRAINT "UserInventory_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquippedCosmetic" ADD CONSTRAINT "UserEquippedCosmetic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquippedCosmetic" ADD CONSTRAINT "UserEquippedCosmetic_shopItemId_fkey" FOREIGN KEY ("shopItemId") REFERENCES "ShopItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAuditLog" ADD CONSTRAINT "SubmissionAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAuditLog" ADD CONSTRAINT "SubmissionAuditLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
