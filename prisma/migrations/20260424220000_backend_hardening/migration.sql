-- Backend hardening: operational events and indexes for production query paths.

CREATE TABLE IF NOT EXISTS "UsageEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "event" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UsageEvent_userId_fkey'
  ) THEN
    ALTER TABLE "UsageEvent"
      ADD CONSTRAINT "UsageEvent_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_xp_idx" ON "User"("xp");
CREATE INDEX IF NOT EXISTS "User_level_idx" ON "User"("level");
CREATE INDEX IF NOT EXISTS "User_streak_idx" ON "User"("streak");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

CREATE INDEX IF NOT EXISTS "Challenge_status_difficulty_idx" ON "Challenge"("status", "difficulty");
CREATE INDEX IF NOT EXISTS "Challenge_categoryId_difficulty_idx" ON "Challenge"("categoryId", "difficulty");
CREATE INDEX IF NOT EXISTS "Challenge_xpReward_idx" ON "Challenge"("xpReward");
CREATE INDEX IF NOT EXISTS "Challenge_createdAt_idx" ON "Challenge"("createdAt");

CREATE INDEX IF NOT EXISTS "Submission_userId_createdAt_idx" ON "Submission"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Submission_challengeId_status_idx" ON "Submission"("challengeId", "status");
CREATE INDEX IF NOT EXISTS "Submission_status_createdAt_idx" ON "Submission"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Submission_userId_challengeId_createdAt_idx" ON "Submission"("userId", "challengeId", "createdAt");

CREATE INDEX IF NOT EXISTS "LeaderboardSnapshot_scope_rank_idx" ON "LeaderboardSnapshot"("scope", "rank");
CREATE INDEX IF NOT EXISTS "LeaderboardSnapshot_userId_capturedAt_idx" ON "LeaderboardSnapshot"("userId", "capturedAt");

CREATE INDEX IF NOT EXISTS "DailyQuest_active_idx" ON "DailyQuest"("active");
CREATE INDEX IF NOT EXISTS "DailyQuest_cadence_idx" ON "DailyQuest"("cadence");
CREATE INDEX IF NOT EXISTS "WeeklyQuest_active_idx" ON "WeeklyQuest"("active");
CREATE INDEX IF NOT EXISTS "WeeklyQuest_cadence_idx" ON "WeeklyQuest"("cadence");
CREATE INDEX IF NOT EXISTS "UserDailyQuest_completedAt_idx" ON "UserDailyQuest"("completedAt");
CREATE INDEX IF NOT EXISTS "UserWeeklyQuest_completedAt_idx" ON "UserWeeklyQuest"("completedAt");

CREATE INDEX IF NOT EXISTS "ChatSession_updatedAt_idx" ON "ChatSession"("updatedAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

CREATE INDEX IF NOT EXISTS "UserProgress_status_idx" ON "UserProgress"("status");
CREATE INDEX IF NOT EXISTS "UserProgress_userId_status_idx" ON "UserProgress"("userId", "status");
CREATE INDEX IF NOT EXISTS "UserProgress_challengeId_status_idx" ON "UserProgress"("challengeId", "status");
CREATE INDEX IF NOT EXISTS "UserProgress_completedAt_idx" ON "UserProgress"("completedAt");

CREATE INDEX IF NOT EXISTS "ChallengeHintUsage_challengeId_idx" ON "ChallengeHintUsage"("challengeId");
CREATE INDEX IF NOT EXISTS "ChallengeHintUsage_usedAt_idx" ON "ChallengeHintUsage"("usedAt");
CREATE INDEX IF NOT EXISTS "VRSession_challengeId_idx" ON "VRSession"("challengeId");

CREATE INDEX IF NOT EXISTS "LearningPath_active_idx" ON "LearningPath"("active");
CREATE INDEX IF NOT EXISTS "UserLearningPathProgress_status_idx" ON "UserLearningPathProgress"("status");
CREATE INDEX IF NOT EXISTS "UserLearningPathProgress_completedAt_idx" ON "UserLearningPathProgress"("completedAt");

CREATE INDEX IF NOT EXISTS "BossBattle_active_idx" ON "BossBattle"("active");
CREATE INDEX IF NOT EXISTS "BossBattle_difficulty_idx" ON "BossBattle"("difficulty");
CREATE INDEX IF NOT EXISTS "BossBattle_categorySlug_idx" ON "BossBattle"("categorySlug");
CREATE INDEX IF NOT EXISTS "BossBattle_createdAt_idx" ON "BossBattle"("createdAt");
CREATE INDEX IF NOT EXISTS "UserBossBattleProgress_status_idx" ON "UserBossBattleProgress"("status");
CREATE INDEX IF NOT EXISTS "UserBossBattleProgress_completedAt_idx" ON "UserBossBattleProgress"("completedAt");

CREATE INDEX IF NOT EXISTS "Quest_active_idx" ON "Quest"("active");
CREATE INDEX IF NOT EXISTS "Quest_cadence_idx" ON "Quest"("cadence");
CREATE INDEX IF NOT EXISTS "UserQuestProgress_completedAt_idx" ON "UserQuestProgress"("completedAt");

CREATE INDEX IF NOT EXISTS "ShopItem_active_idx" ON "ShopItem"("active");
CREATE INDEX IF NOT EXISTS "ShopItem_type_idx" ON "ShopItem"("type");
CREATE INDEX IF NOT EXISTS "ShopItem_rarity_idx" ON "ShopItem"("rarity");

CREATE INDEX IF NOT EXISTS "UsageEvent_userId_idx" ON "UsageEvent"("userId");
CREATE INDEX IF NOT EXISTS "UsageEvent_event_idx" ON "UsageEvent"("event");
CREATE INDEX IF NOT EXISTS "UsageEvent_entityType_idx" ON "UsageEvent"("entityType");
CREATE INDEX IF NOT EXISTS "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

