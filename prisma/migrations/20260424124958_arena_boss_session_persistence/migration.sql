-- CreateTable
CREATE TABLE "ArenaRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "modeSlug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "challengeSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "score" INTEGER NOT NULL DEFAULT 0,
    "accuracy" INTEGER NOT NULL DEFAULT 0,
    "speedBonus" INTEGER NOT NULL DEFAULT 0,
    "noHintBonus" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "attempted" INTEGER NOT NULL DEFAULT 0,
    "secondsRemaining" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "ArenaRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BossBattleStageAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bossBattleId" TEXT NOT NULL,
    "stageId" TEXT,
    "stageIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STARTED',
    "score" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BossBattleStageAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaRun_userId_idx" ON "ArenaRun"("userId");

-- CreateIndex
CREATE INDEX "ArenaRun_modeSlug_idx" ON "ArenaRun"("modeSlug");

-- CreateIndex
CREATE INDEX "ArenaRun_status_idx" ON "ArenaRun"("status");

-- CreateIndex
CREATE INDEX "ArenaRun_score_idx" ON "ArenaRun"("score");

-- CreateIndex
CREATE INDEX "ArenaRun_startedAt_idx" ON "ArenaRun"("startedAt");

-- CreateIndex
CREATE INDEX "BossBattleStageAttempt_userId_idx" ON "BossBattleStageAttempt"("userId");

-- CreateIndex
CREATE INDEX "BossBattleStageAttempt_bossBattleId_idx" ON "BossBattleStageAttempt"("bossBattleId");

-- CreateIndex
CREATE INDEX "BossBattleStageAttempt_stageId_idx" ON "BossBattleStageAttempt"("stageId");

-- CreateIndex
CREATE INDEX "BossBattleStageAttempt_createdAt_idx" ON "BossBattleStageAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "ArenaRun" ADD CONSTRAINT "ArenaRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossBattleStageAttempt" ADD CONSTRAINT "BossBattleStageAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossBattleStageAttempt" ADD CONSTRAINT "BossBattleStageAttempt_bossBattleId_fkey" FOREIGN KEY ("bossBattleId") REFERENCES "BossBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BossBattleStageAttempt" ADD CONSTRAINT "BossBattleStageAttempt_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "BossBattleStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
