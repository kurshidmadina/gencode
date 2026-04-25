import { describe, expect, it } from "vitest";
import {
  assistantMessageSchema,
  challengeCreateSchema,
  challengeQuerySchema,
  leaderboardQuerySchema,
  profileSettingsSchema,
  registerSchema
} from "@/lib/validators";

describe("validators", () => {
  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ name: "Ada", username: "ada", email: "ada@example.com", password: "password" }).success).toBe(
      false
    );
  });

  it("accepts profile settings", () => {
    expect(
      profileSettingsSchema.safeParse({
        name: "Ada Lovelace",
        bio: "Training for systems interviews.",
        favoriteCategories: ["linux", "sql"],
        genieMode: "mentor",
        publicProfile: true
      }).success
    ).toBe(true);
  });

  it("rejects unsafe challenge slugs", () => {
    expect(
      challengeCreateSchema.safeParse({
        title: "Valid Challenge",
        slug: "../bad",
        description: "A realistic description with enough detail.",
        story: "A realistic story with enough detail.",
        instructions: "A realistic instruction body with enough detail.",
        categoryId: "category-id",
        difficulty: "EASY",
        type: "CODING",
        tags: [],
        xpReward: 100,
        coinReward: 10,
        estimatedTime: 15
      }).success
    ).toBe(false);
  });

  it("validates contextual Genie messages", () => {
    const result = assistantMessageSchema.safeParse({
      message: "Explain my failed test",
      mode: "debugging",
      hintLevel: 3,
      currentCode: "function solve() {}",
      failedTests: [{ name: "edge case", expected: "[]", actual: "null" }],
      attempts: 2,
      hintUsage: 1
    });

    expect(result.success).toBe(true);
  });

  it("validates paginated challenge and leaderboard queries", () => {
    const challengeQuery = challengeQuerySchema.safeParse({ category: "linux", page: "2", pageSize: "24" });
    expect(challengeQuery.success).toBe(true);
    if (challengeQuery.success) {
      expect(challengeQuery.data.page).toBe(2);
      expect(challengeQuery.data.pageSize).toBe(24);
    }

    expect(leaderboardQuerySchema.safeParse({ scope: "weekly", difficulty: "INSANE" }).success).toBe(true);
    expect(leaderboardQuerySchema.safeParse({ scope: "weekly", difficulty: "DROP" }).success).toBe(false);
  });
});
