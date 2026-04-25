import type { Difficulty } from "@/lib/game/types";

export type BillingInterval = "monthly" | "yearly";
export type PlanId = "free" | "starter" | "pro" | "elite" | "team" | "enterprise";
export type FeatureGate =
  | "challenge-limit"
  | "difficulty"
  | "genie"
  | "vr"
  | "boss-battle"
  | "arena"
  | "learning-path"
  | "analytics"
  | "team";

export type PlanEntitlements = {
  monthlyChallengeLimit: number | null;
  allowedDifficulties: Difficulty[];
  genieDailyMessageLimit: number | null;
  activeLearningPathLimit: number | null;
  bossBattleAccess: "preview" | "limited" | "standard" | "advanced" | "custom";
  arenaAccess: "preview" | "limited" | "full" | "team";
  vrAccess: "preview" | "locked" | "full" | "team";
  voiceModeAccess: boolean;
  advancedAnalytics: boolean;
  certificates: boolean;
  publicProfile: boolean;
  customCosmetics: boolean;
  streakProtectionsPerMonth: number;
  teamDashboard: boolean;
  teamSeatManagement: boolean;
  adminAnalytics: boolean;
  customChallenges: boolean;
  ssoReady: boolean;
  prioritySupport: boolean;
  enterpriseSupport: boolean;
};

export type PricingPlan = {
  id: PlanId;
  slug: PlanId;
  displayName: string;
  shortName: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  currency: "usd";
  monthlyPriceEnvKey?: string;
  yearlyPriceEnvKey?: string;
  targetAudience: string;
  ctaLabel: string;
  upgradeMessage: string;
  featured?: boolean;
  badge?: string;
  features: string[];
  unavailableFeatures: string[];
  entitlements: PlanEntitlements;
};

const allDifficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD", "EXTREME", "INSANE"];

export const pricingPlans: readonly PricingPlan[] = [
  {
    id: "free",
    slug: "free",
    displayName: "Free",
    shortName: "Free",
    description: "Try Gencode and start building technical momentum.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: "usd",
    targetAudience: "Curious learners, students, and first-time operators.",
    ctaLabel: "Start Free",
    upgradeMessage: "Unlock full paths, harder challenges, and deeper Genie coaching with Pro.",
    features: [
      "25 beginner challenges/month",
      "Easy difficulty access",
      "Basic XP, rank, streaks, and public profile",
      "3 Genie messages/day",
      "1 active learning path",
      "Leaderboard and VR preview"
    ],
    unavailableFeatures: ["Medium+ trials", "Boss battles", "Arena mode", "Advanced analytics", "Certificates"],
    entitlements: {
      monthlyChallengeLimit: 25,
      allowedDifficulties: ["EASY"],
      genieDailyMessageLimit: 3,
      activeLearningPathLimit: 1,
      bossBattleAccess: "preview",
      arenaAccess: "preview",
      vrAccess: "preview",
      voiceModeAccess: false,
      advancedAnalytics: false,
      certificates: false,
      publicProfile: true,
      customCosmetics: false,
      streakProtectionsPerMonth: 0,
      teamDashboard: false,
      teamSeatManagement: false,
      adminAnalytics: false,
      customChallenges: false,
      ssoReady: false,
      prioritySupport: false,
      enterpriseSupport: false
    }
  },
  {
    id: "starter",
    slug: "starter",
    displayName: "Starter",
    shortName: "Starter",
    description: "Build consistent technical habits without getting overwhelmed.",
    monthlyPrice: 9,
    yearlyPrice: 90,
    currency: "usd",
    monthlyPriceEnvKey: "STRIPE_STARTER_MONTHLY_PRICE_ID",
    yearlyPriceEnvKey: "STRIPE_STARTER_YEARLY_PRICE_ID",
    targetAudience: "Beginners and career switchers building daily reps.",
    ctaLabel: "Build Momentum",
    upgradeMessage: "Hard challenges, deeper Genie review, and full boss access unlock with Pro.",
    features: [
      "150 challenges/month",
      "Easy + Medium access",
      "20 Genie messages/day",
      "3 active learning paths",
      "Daily and weekly quests",
      "Basic skill analytics",
      "1 streak protection/month"
    ],
    unavailableFeatures: ["Hard+ trials", "Full boss battles", "Immersive VR", "Team analytics"],
    entitlements: {
      monthlyChallengeLimit: 150,
      allowedDifficulties: ["EASY", "MEDIUM"],
      genieDailyMessageLimit: 20,
      activeLearningPathLimit: 3,
      bossBattleAccess: "limited",
      arenaAccess: "limited",
      vrAccess: "locked",
      voiceModeAccess: false,
      advancedAnalytics: false,
      certificates: false,
      publicProfile: true,
      customCosmetics: true,
      streakProtectionsPerMonth: 1,
      teamDashboard: false,
      teamSeatManagement: false,
      adminAnalytics: false,
      customChallenges: false,
      ssoReady: false,
      prioritySupport: false,
      enterpriseSupport: false
    }
  },
  {
    id: "pro",
    slug: "pro",
    displayName: "Pro",
    shortName: "Pro",
    description: "Unlock the core arena for serious skill growth and interview prep.",
    monthlyPrice: 19,
    yearlyPrice: 190,
    currency: "usd",
    monthlyPriceEnvKey: "STRIPE_PRO_MONTHLY_PRICE_ID",
    yearlyPriceEnvKey: "STRIPE_PRO_YEARLY_PRICE_ID",
    targetAudience: "Serious learners, interview candidates, and working engineers.",
    ctaLabel: "Go Pro",
    upgradeMessage: "Elite unlocks Extreme/Insane trials, advanced interview simulations, and immersive mode.",
    featured: true,
    badge: "Most Popular",
    features: [
      "Unlimited standard challenges",
      "Easy, Medium, and Hard access",
      "100 Genie messages/day",
      "Advanced learning paths",
      "Boss battles and Arena mode",
      "Interview prep, code review, SQL review, Linux coach",
      "Voice mode and completion cards",
      "3 streak protections/month"
    ],
    unavailableFeatures: ["Extreme/Insane access", "Full VR/immersive mode", "Elite cosmetics"],
    entitlements: {
      monthlyChallengeLimit: null,
      allowedDifficulties: ["EASY", "MEDIUM", "HARD"],
      genieDailyMessageLimit: 100,
      activeLearningPathLimit: null,
      bossBattleAccess: "standard",
      arenaAccess: "full",
      vrAccess: "preview",
      voiceModeAccess: true,
      advancedAnalytics: true,
      certificates: true,
      publicProfile: true,
      customCosmetics: true,
      streakProtectionsPerMonth: 3,
      teamDashboard: false,
      teamSeatManagement: false,
      adminAnalytics: false,
      customChallenges: false,
      ssoReady: false,
      prioritySupport: false,
      enterpriseSupport: false
    }
  },
  {
    id: "elite",
    slug: "elite",
    displayName: "Elite",
    shortName: "Elite",
    description: "For advanced mastery, intense interview prep, and the Insane Realm.",
    monthlyPrice: 39,
    yearlyPrice: 390,
    currency: "usd",
    monthlyPriceEnvKey: "STRIPE_ELITE_MONTHLY_PRICE_ID",
    yearlyPriceEnvKey: "STRIPE_ELITE_YEARLY_PRICE_ID",
    targetAudience: "Advanced users, intense interview prep, and serious career growth.",
    ctaLabel: "Become Elite",
    upgradeMessage: "You are in the Insane Realm. Teams can add cohort analytics and shared training.",
    badge: "Best for advanced mastery",
    features: [
      "Everything in Pro",
      "Extreme + Insane challenge access",
      "High-limit Genie coaching with fair-use guardrails",
      "Advanced interview simulations",
      "Advanced boss battles and Insane Algorithm Gauntlet",
      "VR / immersive mode",
      "Weakness diagnosis and personalized plans",
      "10 streak protections/month"
    ],
    unavailableFeatures: ["Team seats", "SSO", "Custom challenge packs"],
    entitlements: {
      monthlyChallengeLimit: null,
      allowedDifficulties: allDifficulties,
      genieDailyMessageLimit: 500,
      activeLearningPathLimit: null,
      bossBattleAccess: "advanced",
      arenaAccess: "full",
      vrAccess: "full",
      voiceModeAccess: true,
      advancedAnalytics: true,
      certificates: true,
      publicProfile: true,
      customCosmetics: true,
      streakProtectionsPerMonth: 10,
      teamDashboard: false,
      teamSeatManagement: false,
      adminAnalytics: false,
      customChallenges: false,
      ssoReady: false,
      prioritySupport: true,
      enterpriseSupport: false
    }
  },
  {
    id: "team",
    slug: "team",
    displayName: "Team",
    shortName: "Team",
    description: "Train a cohort, squad, classroom, or bootcamp with progress visibility.",
    monthlyPrice: 29,
    yearlyPrice: 290,
    currency: "usd",
    monthlyPriceEnvKey: "STRIPE_TEAM_MONTHLY_PRICE_ID",
    yearlyPriceEnvKey: "STRIPE_TEAM_YEARLY_PRICE_ID",
    targetAudience: "Bootcamps, small teams, coding clubs, classrooms, and hiring cohorts.",
    ctaLabel: "Start Team Plan",
    upgradeMessage: "Enterprise adds SSO-ready architecture, custom packs, and contracts.",
    features: [
      "Everything in Pro per seat",
      "Minimum 3 seats",
      "Team dashboard and seat management",
      "Team leaderboard and analytics",
      "Assignment-ready learning paths",
      "Cohort reports and shared boss events",
      "Team quests"
    ],
    unavailableFeatures: ["Private custom packs", "SSO", "Dedicated support SLA"],
    entitlements: {
      monthlyChallengeLimit: null,
      allowedDifficulties: ["EASY", "MEDIUM", "HARD"],
      genieDailyMessageLimit: 150,
      activeLearningPathLimit: null,
      bossBattleAccess: "standard",
      arenaAccess: "team",
      vrAccess: "team",
      voiceModeAccess: true,
      advancedAnalytics: true,
      certificates: true,
      publicProfile: true,
      customCosmetics: true,
      streakProtectionsPerMonth: 3,
      teamDashboard: true,
      teamSeatManagement: true,
      adminAnalytics: true,
      customChallenges: false,
      ssoReady: false,
      prioritySupport: true,
      enterpriseSupport: false
    }
  },
  {
    id: "enterprise",
    slug: "enterprise",
    displayName: "Enterprise",
    shortName: "Enterprise",
    description: "Custom technical training infrastructure for institutions and companies.",
    monthlyPrice: null,
    yearlyPrice: null,
    currency: "usd",
    targetAudience: "Companies, institutions, bootcamps, colleges, and hiring teams.",
    ctaLabel: "Contact Sales",
    upgradeMessage: "Enterprise gives you custom training, analytics, security review support, and contract-ready billing.",
    features: [
      "Everything in Team",
      "Custom challenge packs",
      "Private learning paths",
      "Advanced analytics and custom reports",
      "SSO/SCIM-ready architecture",
      "Dedicated onboarding",
      "Security review documentation",
      "Contract and invoice-ready workflow"
    ],
    unavailableFeatures: [],
    entitlements: {
      monthlyChallengeLimit: null,
      allowedDifficulties: allDifficulties,
      genieDailyMessageLimit: null,
      activeLearningPathLimit: null,
      bossBattleAccess: "custom",
      arenaAccess: "team",
      vrAccess: "team",
      voiceModeAccess: true,
      advancedAnalytics: true,
      certificates: true,
      publicProfile: true,
      customCosmetics: true,
      streakProtectionsPerMonth: 999,
      teamDashboard: true,
      teamSeatManagement: true,
      adminAnalytics: true,
      customChallenges: true,
      ssoReady: true,
      prioritySupport: true,
      enterpriseSupport: true
    }
  }
];

export function getPlanById(planId: string | null | undefined) {
  return pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans[0];
}

export function getPublicPlans() {
  return pricingPlans.filter((plan) => plan.id !== "enterprise");
}

export function getPlanEntitlements(planId: string | null | undefined) {
  return getPlanById(planId).entitlements;
}

export function getStripePriceEnvKey(planId: PlanId, interval: BillingInterval) {
  const plan = getPlanById(planId);
  return interval === "monthly" ? plan.monthlyPriceEnvKey : plan.yearlyPriceEnvKey;
}

export function formatPlanPrice(plan: PricingPlan, interval: BillingInterval) {
  if (plan.monthlyPrice === null) return "Custom";
  const price = interval === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  if (price === null) return "Custom";
  return price === 0 ? "$0" : `$${price}`;
}

export function calculateYearlySavings(plan: PricingPlan) {
  if (!plan.monthlyPrice || !plan.yearlyPrice) return 0;
  const monthlyAnnualized = plan.monthlyPrice * 12;
  return Math.max(0, Math.round(((monthlyAnnualized - plan.yearlyPrice) / monthlyAnnualized) * 100));
}
