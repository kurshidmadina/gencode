import { describe, expect, it } from "vitest";
import { getChallengeAccessState } from "@/lib/game/access";
import { getChallengeBySlug } from "@/lib/game/challenge-data";

describe("challenge access", () => {
  it("keeps easy challenges open for anonymous training", () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(challenge).toBeTruthy();
    const access = getChallengeAccessState({ challenge: challenge!, authenticated: false });
    expect(access.locked).toBe(false);
  });

  it("locks medium challenges before easy completions", () => {
    const challenge = getChallengeBySlug("linux-medium-permissions-audit");
    expect(challenge).toBeTruthy();
    const access = getChallengeAccessState({ challenge: challenge!, authenticated: true, completedByDifficulty: { EASY: 2 } });
    expect(access.locked).toBe(true);
    expect(access.reason).toMatch(/complete enough/i);
  });

  it("unlocks medium challenges after enough easy completions", () => {
    const challenge = getChallengeBySlug("linux-medium-permissions-audit");
    const access = getChallengeAccessState({
      challenge: challenge!,
      authenticated: true,
      completedByDifficulty: { EASY: 8 },
      completedSlugs: new Set(["linux-easy-permissions-audit"])
    });
    expect(access.locked).toBe(false);
  });
});
