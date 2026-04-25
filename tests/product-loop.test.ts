import { describe, expect, it } from "vitest";
import { buildProductLoopBriefing } from "@/lib/game/product-loop";

const baseStats = {
  xp: 0,
  level: 1,
  rank: "Newbie Spark",
  streak: 0,
  completed: 0,
  leaderboardRank: 99,
  weakAreas: ["Graphs"],
  strongAreas: ["Linux"],
  recommended: [
    {
      slug: "linux-easy-permissions-audit",
      title: "Audit deployment directory permissions",
      categorySlug: "linux",
      difficulty: "EASY",
      xpReward: 100,
      estimatedTime: 12
    }
  ],
  recommendedPath: { slug: "linux-survival", name: "Linux Survival Path", finalBossSlug: "linux-log-forensics-boss" }
};

describe("product loop briefing", () => {
  it("gives first-time users a safe first mission plan", () => {
    const briefing = buildProductLoopBriefing(baseStats);
    expect(briefing.segment).toBe("first-session");
    expect(briefing.primaryCta.href).toBe("/challenges/linux-easy-permissions-audit");
    expect(briefing.firstTenMinutePlan.length).toBeGreaterThanOrEqual(4);
    expect(briefing.signals.some((signal) => /Beginner-safe/i.test(signal.label))).toBe(true);
  });

  it("gives returning users a concrete comeback reason", () => {
    const briefing = buildProductLoopBriefing({
      ...baseStats,
      xp: 2840,
      level: 5,
      rank: "Terminal Rookie",
      streak: 6,
      completed: 27,
      leaderboardRank: 18
    });
    expect(briefing.segment).toBe("builder");
    expect(briefing.headline).toMatch(/streak/i);
    expect(briefing.signals.map((signal) => signal.label)).toEqual(
      expect.arrayContaining(["Comeback hook", "Rank pressure", "Weakness repair"])
    );
  });

  it("pushes advanced users toward pressure modes", () => {
    const briefing = buildProductLoopBriefing({
      ...baseStats,
      xp: 16_000,
      level: 18,
      rank: "Debug Samurai",
      streak: 14,
      completed: 72,
      leaderboardRank: 4
    });
    expect(briefing.segment).toBe("late-game");
    expect(briefing.primaryCta.href).toBe("/arena");
    expect(briefing.secondaryCta.href).toBe("/boss-battles");
  });
});
