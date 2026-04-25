import { describe, expect, it } from "vitest";
import { rankLeaderboardPlayers } from "@/lib/game/leaderboard";

describe("leaderboard ranking", () => {
  it("uses XP first and mastery tie breakers after", () => {
    const ranked = rankLeaderboardPlayers([
      { username: "beta", xp: 1000, completed: 10, streak: 2, hardCompletions: 1, extremeCompletions: 0, insaneCompletions: 0, noHintCompletions: 2, speedCompletions: 1 },
      { username: "alpha", xp: 1000, completed: 10, streak: 3, hardCompletions: 1, extremeCompletions: 0, insaneCompletions: 0, noHintCompletions: 2, speedCompletions: 1 },
      { username: "gamma", xp: 1200, completed: 3, streak: 0, hardCompletions: 0, extremeCompletions: 0, insaneCompletions: 0, noHintCompletions: 0, speedCompletions: 0 }
    ]);

    expect(ranked.map((player) => player.username)).toEqual(["gamma", "alpha", "beta"]);
    expect(ranked.map((player) => player.rank)).toEqual([1, 2, 3]);
  });
});
