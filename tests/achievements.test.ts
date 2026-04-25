import { describe, expect, it } from "vitest";
import { evaluateAchievementAwards } from "@/lib/game/achievements";

describe("achievement awarding", () => {
  it("awards milestone achievements from real progress counters", () => {
    const awards = evaluateAchievementAwards({
      completedTotal: 30,
      categoryCounts: { sql: 25, linux: 10 },
      difficultyCounts: { INSANE: 1 },
      typeCounts: { DEBUGGING: 10 },
      streak: 7,
      noHintCompletions: 5,
      speedCompletions: 1,
      level: 12
    });

    expect(awards).toEqual(expect.arrayContaining(["first-blood", "sql-starter", "query-knight", "linux-monk", "debug-hunter", "insane-survivor", "no-hint-hero", "speed-solver", "seven-day-streak"]));
  });
});
