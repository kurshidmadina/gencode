import { describe, expect, it } from "vitest";
import { questEventMatches } from "@/lib/game/quests";

describe("quest progress matching", () => {
  it("matches daily and weekly quest criteria", () => {
    expect(
      questEventMatches(
        { criteria: { category: "sql", count: 1 } },
        { category: "sql", difficulty: "EASY", hintsUsed: 0, streakMaintained: true }
      )
    ).toBe(true);
    expect(
      questEventMatches(
        { criteria: { minDifficulty: "HARD", count: 3 } },
        { category: "linux", difficulty: "MEDIUM", hintsUsed: 0, streakMaintained: true }
      )
    ).toBe(false);
    expect(
      questEventMatches(
        { criteria: { hintsUsed: 0, count: 5 } },
        { category: "git", difficulty: "HARD", hintsUsed: 1, streakMaintained: true }
      )
    ).toBe(false);
  });
});
