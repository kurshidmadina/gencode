import { describe, expect, it } from "vitest";
import { getChallengeAccessState } from "@/lib/game/access";
import { getPlanById, getPlanEntitlements } from "@/lib/billing/plans";
import { getChallengeBySlug } from "@/lib/game/challenge-data";

describe("challenge access", () => {
  const starterBilling = {
    plan: { id: getPlanById("starter").id, displayName: getPlanById("starter").displayName },
    entitlements: { monthlyChallengeLimit: getPlanEntitlements("starter").monthlyChallengeLimit },
    monthlyUsage: { challengesAttempted: 0 }
  };

  it("keeps easy challenges open for anonymous training", () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(challenge).toBeTruthy();
    const access = getChallengeAccessState({ challenge: challenge!, authenticated: false });
    expect(access.locked).toBe(false);
  });

  it("locks medium challenges before easy completions", () => {
    const challenge = getChallengeBySlug("linux-medium-permissions-audit");
    expect(challenge).toBeTruthy();
    const access = getChallengeAccessState({ challenge: challenge!, authenticated: true, completedByDifficulty: { EASY: 2 }, billing: starterBilling });
    expect(access.locked).toBe(true);
    expect(access.reason).toMatch(/complete enough/i);
  });

  it("unlocks medium challenges after enough easy completions", () => {
    const challenge = getChallengeBySlug("linux-medium-permissions-audit");
    const access = getChallengeAccessState({
      challenge: challenge!,
      authenticated: true,
      completedByDifficulty: { EASY: 8 },
      completedSlugs: new Set(["linux-easy-permissions-audit"]),
      billing: starterBilling
    });
    expect(access.locked).toBe(false);
  });
});
