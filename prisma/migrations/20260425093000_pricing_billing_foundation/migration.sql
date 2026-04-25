DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BillingInterval') THEN
    CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY', 'CUSTOM');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'INCOMPLETE_EXPIRED', 'UNPAID', 'PAUSED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeamRole') THEN
    CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SalesLeadStatus') THEN
    CREATE TYPE "SalesLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "monthlyPrice" INTEGER,
  "yearlyPrice" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "stripeMonthlyPriceId" TEXT,
  "stripeYearlyPriceId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserSubscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "stripePriceId" TEXT,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "trialEndsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BillingEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "stripeEventId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UsageCounter" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "periodKey" TEXT NOT NULL,
  "challengesAttempted" INTEGER NOT NULL DEFAULT 0,
  "challengesCompleted" INTEGER NOT NULL DEFAULT 0,
  "genieMessagesUsed" INTEGER NOT NULL DEFAULT 0,
  "vrSessionsUsed" INTEGER NOT NULL DEFAULT 0,
  "arenaRunsUsed" INTEGER NOT NULL DEFAULT 0,
  "bossBattlesAttempted" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "seatLimit" INTEGER NOT NULL DEFAULT 3,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InvoiceRecord" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeInvoiceId" TEXT NOT NULL,
  "amountPaid" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "status" TEXT NOT NULL,
  "hostedInvoiceUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SalesLead" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "organization" TEXT,
  "teamSize" INTEGER,
  "useCase" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'contact-sales',
  "status" "SalesLeadStatus" NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SubscriptionPlan_slug_key" ON "SubscriptionPlan"("slug");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_active_idx" ON "SubscriptionPlan"("active");
CREATE INDEX IF NOT EXISTS "SubscriptionPlan_slug_idx" ON "SubscriptionPlan"("slug");

CREATE UNIQUE INDEX IF NOT EXISTS "UserSubscription_stripeSubscriptionId_key" ON "UserSubscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "UserSubscription_userId_idx" ON "UserSubscription"("userId");
CREATE INDEX IF NOT EXISTS "UserSubscription_planId_idx" ON "UserSubscription"("planId");
CREATE INDEX IF NOT EXISTS "UserSubscription_status_idx" ON "UserSubscription"("status");
CREATE INDEX IF NOT EXISTS "UserSubscription_stripeCustomerId_idx" ON "UserSubscription"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "UserSubscription_stripeSubscriptionId_idx" ON "UserSubscription"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "UserSubscription_currentPeriodEnd_idx" ON "UserSubscription"("currentPeriodEnd");

CREATE UNIQUE INDEX IF NOT EXISTS "BillingEvent_stripeEventId_key" ON "BillingEvent"("stripeEventId");
CREATE INDEX IF NOT EXISTS "BillingEvent_userId_idx" ON "BillingEvent"("userId");
CREATE INDEX IF NOT EXISTS "BillingEvent_type_idx" ON "BillingEvent"("type");
CREATE INDEX IF NOT EXISTS "BillingEvent_processedAt_idx" ON "BillingEvent"("processedAt");
CREATE INDEX IF NOT EXISTS "BillingEvent_createdAt_idx" ON "BillingEvent"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "UsageCounter_userId_periodKey_key" ON "UsageCounter"("userId", "periodKey");
CREATE INDEX IF NOT EXISTS "UsageCounter_userId_idx" ON "UsageCounter"("userId");
CREATE INDEX IF NOT EXISTS "UsageCounter_periodKey_idx" ON "UsageCounter"("periodKey");
CREATE INDEX IF NOT EXISTS "UsageCounter_updatedAt_idx" ON "UsageCounter"("updatedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "Team_stripeSubscriptionId_key" ON "Team"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Team_ownerId_idx" ON "Team"("ownerId");
CREATE INDEX IF NOT EXISTS "Team_planId_idx" ON "Team"("planId");
CREATE INDEX IF NOT EXISTS "Team_stripeCustomerId_idx" ON "Team"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Team_stripeSubscriptionId_idx" ON "Team"("stripeSubscriptionId");
CREATE INDEX IF NOT EXISTS "Team_createdAt_idx" ON "Team"("createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "TeamMember_role_idx" ON "TeamMember"("role");

CREATE UNIQUE INDEX IF NOT EXISTS "InvoiceRecord_stripeInvoiceId_key" ON "InvoiceRecord"("stripeInvoiceId");
CREATE INDEX IF NOT EXISTS "InvoiceRecord_userId_idx" ON "InvoiceRecord"("userId");
CREATE INDEX IF NOT EXISTS "InvoiceRecord_status_idx" ON "InvoiceRecord"("status");
CREATE INDEX IF NOT EXISTS "InvoiceRecord_createdAt_idx" ON "InvoiceRecord"("createdAt");

CREATE INDEX IF NOT EXISTS "SalesLead_userId_idx" ON "SalesLead"("userId");
CREATE INDEX IF NOT EXISTS "SalesLead_email_idx" ON "SalesLead"("email");
CREATE INDEX IF NOT EXISTS "SalesLead_status_idx" ON "SalesLead"("status");
CREATE INDEX IF NOT EXISTS "SalesLead_createdAt_idx" ON "SalesLead"("createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSubscription_userId_fkey') THEN
    ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserSubscription_planId_fkey') THEN
    ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillingEvent_userId_fkey') THEN
    ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UsageCounter_userId_fkey') THEN
    ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Team_ownerId_fkey') THEN
    ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Team_planId_fkey') THEN
    ALTER TABLE "Team" ADD CONSTRAINT "Team_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_teamId_fkey') THEN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TeamMember_userId_fkey') THEN
    ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceRecord_userId_fkey') THEN
    ALTER TABLE "InvoiceRecord" ADD CONSTRAINT "InvoiceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SalesLead_userId_fkey') THEN
    ALTER TABLE "SalesLead" ADD CONSTRAINT "SalesLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
