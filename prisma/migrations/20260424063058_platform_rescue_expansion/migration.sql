-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "examples" JSONB,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "successCriteria" JSONB;

-- CreateTable
CREATE TABLE "ChallengePrerequisite" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyQuest" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cadence" "QuestCadence" NOT NULL DEFAULT 'WEEKLY',
    "xpReward" INTEGER NOT NULL,
    "coinReward" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWeeklyQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "goal" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "assignedFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWeeklyQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "completedChallenges" INTEGER NOT NULL DEFAULT 0,
    "bestDifficulty" TEXT,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "averageAttempts" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengePrerequisite_challengeId_idx" ON "ChallengePrerequisite"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengePrerequisite_prerequisiteId_idx" ON "ChallengePrerequisite"("prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengePrerequisite_challengeId_prerequisiteId_key" ON "ChallengePrerequisite"("challengeId", "prerequisiteId");

-- CreateIndex
CREATE INDEX "CoinTransaction_userId_idx" ON "CoinTransaction"("userId");

-- CreateIndex
CREATE INDEX "CoinTransaction_createdAt_idx" ON "CoinTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyQuest_slug_key" ON "WeeklyQuest"("slug");

-- CreateIndex
CREATE INDEX "UserWeeklyQuest_userId_idx" ON "UserWeeklyQuest"("userId");

-- CreateIndex
CREATE INDEX "UserWeeklyQuest_assignedFor_idx" ON "UserWeeklyQuest"("assignedFor");

-- CreateIndex
CREATE UNIQUE INDEX "UserWeeklyQuest_userId_questId_assignedFor_key" ON "UserWeeklyQuest"("userId", "questId", "assignedFor");

-- CreateIndex
CREATE INDEX "CategoryProgress_userId_idx" ON "CategoryProgress"("userId");

-- CreateIndex
CREATE INDEX "CategoryProgress_categoryId_idx" ON "CategoryProgress"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryProgress_userId_categoryId_key" ON "CategoryProgress"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_actorId_idx" ON "AdminAuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_action_idx" ON "AdminAuditLog"("action");

-- CreateIndex
CREATE INDEX "AdminAuditLog_target_idx" ON "AdminAuditLog"("target");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "ChallengePrerequisite" ADD CONSTRAINT "ChallengePrerequisite_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengePrerequisite" ADD CONSTRAINT "ChallengePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinTransaction" ADD CONSTRAINT "CoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeeklyQuest" ADD CONSTRAINT "UserWeeklyQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWeeklyQuest" ADD CONSTRAINT "UserWeeklyQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "WeeklyQuest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProgress" ADD CONSTRAINT "CategoryProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryProgress" ADD CONSTRAINT "CategoryProgress_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
