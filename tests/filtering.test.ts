import { describe, expect, it } from "vitest";
import { challengeCatalog } from "@/lib/game/challenge-data";
import { filterChallenges } from "@/lib/game/filtering";
import { categories, challengeTypes, difficulties } from "@/lib/game/types";

describe("challenge filtering", () => {
  it("generates at least 300 meaningful challenges", () => {
    expect(challengeCatalog.length).toBeGreaterThanOrEqual(300);
    expect(new Set(challengeCatalog.map((challenge) => challenge.slug)).size).toBe(challengeCatalog.length);
    expect(challengeCatalog.every((challenge) => challenge.instructions.length > 40)).toBe(true);
  });

  it("covers every visible technical track and difficulty tier", () => {
    for (const category of categories) {
      const categoryChallenges = challengeCatalog.filter((challenge) => challenge.categorySlug === category.slug);
      expect(categoryChallenges.length).toBeGreaterThanOrEqual(25);
      for (const difficulty of difficulties) {
        expect(categoryChallenges.some((challenge) => challenge.difficulty === difficulty)).toBe(true);
      }
    }

    for (const type of challengeTypes) {
      expect(challengeCatalog.some((challenge) => challenge.type === type)).toBe(true);
    }
  });

  it("includes complete validation and learning metadata for every challenge", () => {
    expect(
      challengeCatalog.every(
        (challenge) =>
          challenge.title &&
          challenge.slug &&
          challenge.story.length > 40 &&
          challenge.instructions.length > 40 &&
          challenge.testCases.length > 0 &&
          challenge.hiddenTestCases.length > 0 &&
          challenge.hints.length > 0 &&
          Boolean(challenge.solution) &&
          challenge.explanation.length > 40 &&
          challenge.xpReward > 0 &&
          challenge.tags.length > 0 &&
          challenge.estimatedTime > 0
      )
    ).toBe(true);
  });

  it("filters by category and difficulty", () => {
    const sqlEasy = filterChallenges(challengeCatalog, { category: "sql", difficulty: "EASY" });
    expect(sqlEasy.length).toBeGreaterThan(0);
    expect(sqlEasy.every((challenge) => challenge.categorySlug === "sql" && challenge.difficulty === "EASY")).toBe(true);
  });

  it("filters by search query", () => {
    const results = filterChallenges(challengeCatalog, { query: "permissions" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((challenge) => challenge.tags.includes("permissions"))).toBe(true);
  });

  it("filters by type, tag, and XP ceiling", () => {
    const results = filterChallenges(challengeCatalog, { type: "SQL", tag: "transactions", maxXp: "100" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((challenge) => challenge.type === "SQL")).toBe(true);
    expect(results.every((challenge) => challenge.tags.includes("transactions"))).toBe(true);
    expect(results.every((challenge) => challenge.xpReward <= 100)).toBe(true);
  });
});
