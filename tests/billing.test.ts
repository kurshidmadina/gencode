import { describe, expect, it } from "vitest";
import { canAccessArena, canAccessBossBattle, canAccessDifficulty, canEnterVR, canUseGenie, getPlanLimitMessage, getUpgradeRecommendation } from "@/lib/billing/entitlements";
import { calculateYearlySavings, getPlanById, getPublicPlans, pricingPlans } from "@/lib/billing/plans";
import { getDailyPeriodKey, getMonthlyPeriodKey } from "@/lib/billing/usage";
import { checkoutSessionSchema, salesLeadSchema } from "@/lib/billing/validators";

describe("pricing config", () => {
  it("defines all startup SaaS plans with required fields", () => {
    expect(pricingPlans.map((plan) => plan.id)).toEqual(["free", "starter", "pro", "elite", "team", "enterprise"]);
    for (const plan of pricingPlans) {
      expect(plan.displayName.length).toBeGreaterThan(2);
      expect(plan.description.length).toBeGreaterThan(20);
      expect(plan.features.length).toBeGreaterThanOrEqual(5);
      expect(plan.entitlements.allowedDifficulties.length).toBeGreaterThan(0);
    }
  });

  it("marks Pro as the most popular paid plan", () => {
    expect(getPlanById("pro").featured).toBe(true);
    expect(getPlanById("pro").badge).toMatch(/popular/i);
  });

  it("calculates yearly savings from configurable prices", () => {
    expect(calculateYearlySavings(getPlanById("starter"))).toBe(17);
    expect(calculateYearlySavings(getPlanById("pro"))).toBe(17);
    expect(calculateYearlySavings(getPlanById("elite"))).toBe(17);
  });

  it("keeps public plan catalog available for pricing UI", () => {
    expect(getPublicPlans().length).toBeGreaterThanOrEqual(5);
    expect(getPublicPlans().some((plan) => plan.id === "pro")).toBe(true);
  });
});

describe("entitlements", () => {
  it("enforces difficulty access by plan", () => {
    expect(canAccessDifficulty("free", "EASY")).toBe(true);
    expect(canAccessDifficulty("free", "MEDIUM")).toBe(false);
    expect(canAccessDifficulty("starter", "MEDIUM")).toBe(true);
    expect(canAccessDifficulty("pro", "HARD")).toBe(true);
    expect(canAccessDifficulty("pro", "INSANE")).toBe(false);
    expect(canAccessDifficulty("elite", "INSANE")).toBe(true);
  });

  it("enforces Genie, VR, Arena, and boss access", () => {
    expect(canUseGenie("free", 2)).toBe(true);
    expect(canUseGenie("free", 3)).toBe(false);
    expect(canEnterVR("pro")).toBe(false);
    expect(canEnterVR("elite")).toBe(true);
    expect(canAccessArena("starter")).toBe(false);
    expect(canAccessArena("pro")).toBe(true);
    expect(canAccessBossBattle("starter", "HARD")).toBe(false);
    expect(canAccessBossBattle("pro", "HARD")).toBe(true);
    expect(canAccessBossBattle("elite", "INSANE")).toBe(true);
  });

  it("returns useful upgrade messaging", () => {
    const recommendation = getUpgradeRecommendation("free", "difficulty", "HARD");
    expect(recommendation.recommendedPlan.id).toBe("pro");
    expect(recommendation.href).toContain("/pricing");
    expect(getPlanLimitMessage("starter", "challenge-limit")).toContain("150");
  });
});

describe("billing validation and periods", () => {
  it("validates checkout and sales lead payloads", () => {
    expect(checkoutSessionSchema.safeParse({ planId: "pro", billingInterval: "yearly" }).success).toBe(true);
    expect(checkoutSessionSchema.safeParse({ planId: "enterprise", billingInterval: "yearly" }).success).toBe(false);
    expect(salesLeadSchema.safeParse({
      name: "Maya Chen",
      email: "maya@gencode.dev",
      organization: "Gencode Labs",
      teamSize: 12,
      useCase: "team-training",
      message: "We want team analytics and custom challenge paths for a cohort."
    }).success).toBe(true);
  });

  it("builds stable usage period keys", () => {
    const date = new Date("2026-04-25T12:30:00.000Z");
    expect(getDailyPeriodKey(date)).toBe("2026-04-25");
    expect(getMonthlyPeriodKey(date)).toBe("2026-04");
  });
});
