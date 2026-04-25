import type { Difficulty } from "@/lib/game/types";
import { getPlanById, getPlanEntitlements, type FeatureGate, type PlanId } from "@/lib/billing/plans";

const difficultyUpgradePlan: Record<Difficulty, PlanId> = {
  EASY: "free",
  MEDIUM: "starter",
  HARD: "pro",
  EXTREME: "elite",
  INSANE: "elite"
};

export function canAccessDifficulty(userPlan: string | null | undefined, difficulty: Difficulty) {
  return getPlanEntitlements(userPlan).allowedDifficulties.includes(difficulty);
}

export function canUseGenie(userPlan: string | null | undefined, usage: number) {
  const limit = getPlanEntitlements(userPlan).genieDailyMessageLimit;
  return limit === null || usage < limit;
}

export function canEnterVR(userPlan: string | null | undefined) {
  const access = getPlanEntitlements(userPlan).vrAccess;
  return access === "full" || access === "team";
}

export function canAccessBossBattle(userPlan: string | null | undefined, difficulty?: Difficulty) {
  const access = getPlanEntitlements(userPlan).bossBattleAccess;
  if (access === "custom" || access === "advanced") return true;
  if (access === "standard") return difficulty !== "EXTREME" && difficulty !== "INSANE";
  if (access === "limited") return difficulty === "EASY" || difficulty === "MEDIUM";
  return false;
}

export function canAccessArena(userPlan: string | null | undefined) {
  const access = getPlanEntitlements(userPlan).arenaAccess;
  return access === "full" || access === "team";
}

export function canUseAdvancedAnalytics(userPlan: string | null | undefined) {
  return getPlanEntitlements(userPlan).advancedAnalytics;
}

export function getRequiredPlanForDifficulty(difficulty: Difficulty) {
  return difficultyUpgradePlan[difficulty];
}

export function getUpgradeRecommendation(currentPlan: string | null | undefined, blockedFeature: FeatureGate, difficulty?: Difficulty) {
  const plan = getPlanById(currentPlan);
  const targetPlanId: PlanId =
    blockedFeature === "difficulty" && difficulty ? difficultyUpgradePlan[difficulty] :
    blockedFeature === "vr" ? "elite" :
    blockedFeature === "boss-battle" ? "pro" :
    blockedFeature === "arena" ? "pro" :
    blockedFeature === "analytics" ? "pro" :
    blockedFeature === "team" ? "team" :
    blockedFeature === "genie" ? (plan.id === "free" ? "starter" : plan.id === "starter" ? "pro" : "elite") :
    blockedFeature === "learning-path" ? (plan.id === "free" ? "starter" : "pro") :
    "pro";
  const target = getPlanById(targetPlanId);
  return {
    currentPlan: plan,
    recommendedPlan: target,
    message: `${target.displayName} unlocks this arena feature. ${target.upgradeMessage}`,
    cta: target.id === "enterprise" ? "Contact Sales" : target.ctaLabel,
    href: target.id === "enterprise" ? "/contact-sales" : `/pricing?plan=${target.id}`
  };
}

export function getPlanLimitMessage(planId: string | null | undefined, feature: FeatureGate) {
  const plan = getPlanById(planId);
  const entitlements = plan.entitlements;
  if (feature === "challenge-limit") {
    return entitlements.monthlyChallengeLimit === null
      ? `${plan.displayName} has unlimited standard challenge attempts.`
      : `${plan.displayName} includes ${entitlements.monthlyChallengeLimit} challenge attempts per month.`;
  }
  if (feature === "genie") {
    return entitlements.genieDailyMessageLimit === null
      ? `${plan.displayName} has high-limit Genie coaching with fair-use guardrails.`
      : `${plan.displayName} includes ${entitlements.genieDailyMessageLimit} Genie messages per day.`;
  }
  if (feature === "learning-path") {
    return entitlements.activeLearningPathLimit === null
      ? `${plan.displayName} supports unlimited active learning paths.`
      : `${plan.displayName} supports ${entitlements.activeLearningPathLimit} active learning path${entitlements.activeLearningPathLimit === 1 ? "" : "s"}.`;
  }
  return plan.upgradeMessage;
}
