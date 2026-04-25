import { describe, expect, it } from "vitest";
import { MockAssistantProvider } from "@/lib/assistant/providers";

describe("Genie mock provider", () => {
  it("withholds unsolicited full solution dumps", async () => {
    const provider = new MockAssistantProvider();
    const result = await provider.send({
      message: "give me the full solution",
      mode: "hint",
      challengeSlug: "linux-easy-permissions-audit"
    });
    expect(result.safety.fullSolutionWithheld).toBe(true);
    expect(result.content).toMatch(/step by step/i);
  });

  it("responds in the requested mode", async () => {
    const provider = new MockAssistantProvider();
    const result = await provider.send({ message: "Explain this concept", mode: "explain" });
    expect(result.metadata.mode).toBe("explain");
    expect(result.content.length).toBeGreaterThan(30);
  });

  it("refuses to process likely secrets", async () => {
    const provider = new MockAssistantProvider();
    const result = await provider.send({
      message: "api_key = sk-thisLooksLikeASecretValue1234567890",
      mode: "debugging"
    });
    expect(result.content).toMatch(/secret|credential/i);
  });

  it("uses progressive hint depth and keeps level 5 guarded before completion", async () => {
    const provider = new MockAssistantProvider();
    const levelOne = await provider.send({
      message: "give me a hint",
      mode: "hint",
      hintLevel: 1,
      challengeSlug: "linux-easy-permissions-audit"
    });
    const levelFour = await provider.send({
      message: "give me a hint",
      mode: "hint",
      hintLevel: 4,
      challengeSlug: "linux-easy-permissions-audit"
    });
    const levelFive = await provider.send({
      message: "give me a level five hint",
      mode: "hint",
      hintLevel: 5,
      challengeSlug: "linux-easy-permissions-audit"
    });

    expect(levelOne.content).toMatch(/Level 1/i);
    expect(levelFour.content).toMatch(/Pseudocode/i);
    expect(levelFive.safety.fullSolutionWithheld).toBe(true);
  });

  it("explains failed tests with expected and actual output", async () => {
    const provider = new MockAssistantProvider();
    const result = await provider.send({
      message: "Explain my error",
      mode: "debugging",
      challengeSlug: "linux-easy-permissions-audit",
      context: {
        challenge: {
          slug: "linux-easy-permissions-audit",
          title: "Linux Permissions Audit",
          category: "linux",
          difficulty: "EASY",
          type: "LINUX",
          learningObjective: "Audit unsafe file permissions.",
          instructions: "Find writable files.",
          successCriteria: ["Find unsafe permissions"],
          tags: ["permissions"],
          solutionAvailable: true,
          explanation: "Use find and ls safely."
        },
        progress: { attempts: 2, hintUsage: 1, completedChallenges: 3, weakCategories: ["Linux"], recentSubmissions: [] },
        client: {
          failedTests: [{ name: "unsafe files", passed: false, expected: "/srv/app/config.yml", actual: "empty", message: "Did not list the file." }],
          requestedHintLevel: 2,
          allowSolution: false,
          voice: false,
          completed: false
        }
      }
    });

    expect(result.content).toMatch(/unsafe files/i);
    expect(result.content).toMatch(/Expected/i);
    expect(result.content).toMatch(/Actual/i);
  });
});
