import { canReachDatabase } from "@/lib/db-health";
import { canUseGenie } from "@/lib/billing/entitlements";
import { getPlanById, getPlanEntitlements, type PlanId } from "@/lib/billing/plans";
import { prisma } from "@/lib/prisma";

export type UsagePeriod = "daily" | "monthly";
export type UsageField =
  | "challengesAttempted"
  | "challengesCompleted"
  | "genieMessagesUsed"
  | "vrSessionsUsed"
  | "arenaRunsUsed"
  | "bossBattlesAttempted";

export function getDailyPeriodKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getMonthlyPeriodKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export function getPeriodKey(period: UsagePeriod, date = new Date()) {
  return period === "daily" ? getDailyPeriodKey(date) : getMonthlyPeriodKey(date);
}

export async function getUserPlanId(userId?: string): Promise<PlanId> {
  if (!userId || !(await canReachDatabase())) return "free";
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        subscriptions: {
          where: { status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
          orderBy: { updatedAt: "desc" },
          take: 1,
          select: { planId: true }
        },
        teamMemberships: {
          take: 1,
          include: { team: { select: { planId: true } } }
        }
      }
    });
    if (user?.subscriptions[0]?.planId) return getPlanById(user.subscriptions[0].planId).id;
    if (user?.teamMemberships[0]?.team?.planId) return getPlanById(user.teamMemberships[0].team.planId).id;
    if (user?.role === "ADMIN") return "enterprise";
  } catch {
    return "free";
  }
  return "free";
}

export async function getUsageCounter(userId: string | undefined, period: UsagePeriod, date = new Date()) {
  const periodKey = getPeriodKey(period, date);
  if (!userId || !(await canReachDatabase())) {
    return {
      periodKey,
      challengesAttempted: 0,
      challengesCompleted: 0,
      genieMessagesUsed: 0,
      vrSessionsUsed: 0,
      arenaRunsUsed: 0,
      bossBattlesAttempted: 0
    };
  }

  try {
    return await prisma.usageCounter.upsert({
      where: { userId_periodKey: { userId, periodKey } },
      update: {},
      create: { userId, periodKey }
    });
  } catch {
    return {
      periodKey,
      challengesAttempted: 0,
      challengesCompleted: 0,
      genieMessagesUsed: 0,
      vrSessionsUsed: 0,
      arenaRunsUsed: 0,
      bossBattlesAttempted: 0
    };
  }
}

export async function incrementUsageCounter(userId: string | undefined, period: UsagePeriod, field: UsageField, amount = 1) {
  if (!userId || !(await canReachDatabase())) return null;
  const periodKey = getPeriodKey(period);
  return prisma.usageCounter.upsert({
    where: { userId_periodKey: { userId, periodKey } },
    create: { userId, periodKey, [field]: amount },
    update: { [field]: { increment: amount } }
  });
}

export async function getUserBillingSnapshot(userId?: string) {
  const planId = await getUserPlanId(userId);
  const plan = getPlanById(planId);
  const [dailyUsage, monthlyUsage] = await Promise.all([
    getUsageCounter(userId, "daily"),
    getUsageCounter(userId, "monthly")
  ]);
  const entitlements = getPlanEntitlements(plan.id);

  return {
    plan,
    entitlements,
    dailyUsage,
    monthlyUsage,
    limits: {
      genieDailyRemaining:
        entitlements.genieDailyMessageLimit === null
          ? null
          : Math.max(0, entitlements.genieDailyMessageLimit - dailyUsage.genieMessagesUsed),
      monthlyChallengesRemaining:
        entitlements.monthlyChallengeLimit === null
          ? null
          : Math.max(0, entitlements.monthlyChallengeLimit - monthlyUsage.challengesAttempted)
    },
    canUseGenieNow: canUseGenie(plan.id, dailyUsage.genieMessagesUsed)
  };
}
