import { canReachDatabase } from "@/lib/db-health";
import { canAccessDifficulty, getUpgradeRecommendation } from "@/lib/billing/entitlements";
import { getUserBillingSnapshot } from "@/lib/billing/usage";
import type { PlanEntitlements } from "@/lib/billing/plans";
import type { PlanId } from "@/lib/billing/plans";
import { canUnlockDifficulty } from "@/lib/game/progression";
import type { Difficulty, GeneratedChallenge } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";

export type ChallengeAccessState = {
  locked: boolean;
  reason: string;
  missingPrerequisites: string[];
  completedByDifficulty: Partial<Record<Difficulty, number>>;
  planId?: PlanId;
  upgradeHref?: string;
};

type BillingAccessSnapshot = {
  plan: { id: PlanId; displayName: string };
  entitlements: Pick<PlanEntitlements, "monthlyChallengeLimit">;
  monthlyUsage: { challengesAttempted: number };
};

export function getChallengeAccessState({
  challenge,
  completedByDifficulty = {},
  completedSlugs = new Set<string>(),
  authenticated = false,
  billing
}: {
  challenge: GeneratedChallenge;
  completedByDifficulty?: Partial<Record<Difficulty, number>>;
  completedSlugs?: Set<string>;
  authenticated?: boolean;
  billing?: BillingAccessSnapshot;
}): ChallengeAccessState {
  const missingPrerequisites = challenge.prerequisites.filter((slug) => !completedSlugs.has(slug));
  const difficultyUnlocked = canUnlockDifficulty(challenge.difficulty, completedByDifficulty);
  const planId = billing?.plan.id ?? "free";

  if (!authenticated && challenge.difficulty !== "EASY") {
    return {
      locked: true,
      reason: "Log in and clear the lower tiers to unlock this mission.",
      missingPrerequisites,
      completedByDifficulty,
      planId
    };
  }

  if (!canAccessDifficulty(planId, challenge.difficulty)) {
    const upgrade = getUpgradeRecommendation(planId, "difficulty", challenge.difficulty);
    return {
      locked: true,
      reason: `${upgrade.recommendedPlan.displayName} required for ${challenge.difficulty} missions. ${upgrade.recommendedPlan.upgradeMessage}`,
      missingPrerequisites,
      completedByDifficulty,
      planId,
      upgradeHref: upgrade.href
    };
  }

  if (billing?.entitlements.monthlyChallengeLimit !== null && billing && billing.monthlyUsage.challengesAttempted >= billing.entitlements.monthlyChallengeLimit) {
    const upgrade = getUpgradeRecommendation(planId, "challenge-limit");
    return {
      locked: true,
      reason: `Monthly challenge limit reached on ${billing.plan.displayName}. ${upgrade.recommendedPlan.displayName} unlocks more training volume.`,
      missingPrerequisites,
      completedByDifficulty,
      planId,
      upgradeHref: upgrade.href
    };
  }

  if (!difficultyUnlocked) {
    return {
      locked: true,
      reason: `Complete enough ${Object.keys(challenge.unlockRules.requiredCompletions).join(", ") || "lower-tier"} missions to unlock ${challenge.difficulty}.`,
      missingPrerequisites,
      completedByDifficulty,
      planId
    };
  }

  if (missingPrerequisites.length > 0) {
    return {
      locked: true,
      reason: `Clear ${missingPrerequisites.length} prerequisite mission${missingPrerequisites.length === 1 ? "" : "s"} first.`,
      missingPrerequisites,
      completedByDifficulty,
      planId
    };
  }

  return {
    locked: false,
    reason: "Mission unlocked.",
    missingPrerequisites: [],
    completedByDifficulty,
    planId
  };
}

export async function getUserChallengeAccess(userId: string | undefined, challenge: GeneratedChallenge) {
  if (!userId || !(await canReachDatabase())) {
    return getChallengeAccessState({ challenge, authenticated: Boolean(userId) });
  }

  try {
    const completed = await prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { slug: true, difficulty: true } } }
    });

    const completedByDifficulty = completed.reduce<Partial<Record<Difficulty, number>>>((acc, item) => {
      const difficulty = item.challenge.difficulty as Difficulty;
      acc[difficulty] = (acc[difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const completedSlugs = new Set(completed.map((item) => item.challenge.slug));

    const billing = await getUserBillingSnapshot(userId);
    return getChallengeAccessState({
      challenge,
      completedByDifficulty,
      completedSlugs,
      authenticated: true,
      billing
    });
  } catch {
    return getChallengeAccessState({ challenge, authenticated: true });
  }
}

export async function getUserChallengeAccessMap(userId: string | undefined, challenges: GeneratedChallenge[]) {
  if (!userId || !(await canReachDatabase())) {
    const billing = await getUserBillingSnapshot(userId);
    return Object.fromEntries(challenges.map((challenge) => [challenge.slug, getChallengeAccessState({ challenge, authenticated: Boolean(userId), billing })]));
  }

  try {
    const completed = await prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { slug: true, difficulty: true } } }
    });
    const completedByDifficulty = completed.reduce<Partial<Record<Difficulty, number>>>((acc, item) => {
      const difficulty = item.challenge.difficulty as Difficulty;
      acc[difficulty] = (acc[difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const completedSlugs = new Set(completed.map((item) => item.challenge.slug));

    const billing = await getUserBillingSnapshot(userId);
    return Object.fromEntries(
      challenges.map((challenge) => [
        challenge.slug,
        getChallengeAccessState({ challenge, completedByDifficulty, completedSlugs, authenticated: true, billing })
      ])
    );
  } catch {
    return Object.fromEntries(challenges.map((challenge) => [challenge.slug, getChallengeAccessState({ challenge, authenticated: true })]));
  }
}
