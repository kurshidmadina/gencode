import { describe, expect, it } from "vitest";
import { calculateSubmissionRewards, canUnlockDifficulty, getLevelForXp, getRankName } from "@/lib/game/progression";
import { questGoal, questMatchesCompletion, resolveBestScore, resolveProgressStatus } from "@/lib/game/submission-progress";

describe("progression", () => {
  it("calculates levels and ranks from XP", () => {
    const level = getLevelForXp(3000);
    expect(level.level).toBeGreaterThan(1);
    expect(getRankName(level.level)).toBeTruthy();
  });

  it("enforces difficulty unlock rules", () => {
    expect(canUnlockDifficulty("EASY", {})).toBe(true);
    expect(canUnlockDifficulty("MEDIUM", { EASY: 7 })).toBe(false);
    expect(canUnlockDifficulty("MEDIUM", { EASY: 8 })).toBe(true);
    expect(canUnlockDifficulty("INSANE", { EXTREME: 5 })).toBe(false);
  });

  it("applies hint penalties to first completion rewards", () => {
    const clean = calculateSubmissionRewards({ difficulty: "HARD", score: 100, usedHints: 0, firstCompletion: true });
    const hinted = calculateSubmissionRewards({ difficulty: "HARD", score: 100, usedHints: 3, firstCompletion: true });
    expect(clean.xp).toBeGreaterThan(hinted.xp);
    expect(clean.coins).toBeGreaterThan(hinted.coins);
  });

  it("does not regress completed progress after a failed retry", () => {
    expect(resolveProgressStatus({ resultStatus: "FAILED", existingStatus: "COMPLETED" })).toBe("COMPLETED");
    expect(resolveProgressStatus({ resultStatus: "PARTIAL", existingStatus: "IN_PROGRESS" })).toBe("IN_PROGRESS");
    expect(resolveBestScore(92, 48)).toBe(92);
    expect(resolveBestScore(60, 97)).toBe(97);
  });

  it("matches quest progress using completion metadata", () => {
    expect(questGoal({ count: 3 })).toBe(3);
    expect(
      questMatchesCompletion({
        criteria: { category: "sql", hintsUsed: 0, count: 1 },
        categorySlug: "sql",
        difficulty: "EASY",
        usedHints: 0
      })
    ).toBe(true);
    expect(
      questMatchesCompletion({
        criteria: { minDifficulty: "HARD", count: 3 },
        categorySlug: "linux",
        difficulty: "MEDIUM",
        usedHints: 0
      })
    ).toBe(false);
  });
});
