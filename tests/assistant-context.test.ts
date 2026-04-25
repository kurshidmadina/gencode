import { describe, expect, it } from "vitest";
import { buildAssistantContext, buildAssistantPrompt } from "@/lib/assistant/context";

describe("Genie context and prompt builder", () => {
  it("builds safe challenge context without sensitive user fields", async () => {
    const context = await buildAssistantContext({
      username: "queryforge",
      challengeSlug: "sql-easy-duplicate-transactions",
      clientContext: {
        currentCode: "select * from payments;",
        attempts: 1,
        hintLevel: 2,
        hintUsage: 1
      }
    });

    expect(context.challenge?.title).toMatch(/duplicate/i);
    expect(context.client.currentCode).toContain("payments");
    expect(JSON.stringify(context)).not.toMatch(/email|passwordHash|api_key/i);
  });

  it("injects failed tests, mode policy, and progression into the server prompt", async () => {
    const context = await buildAssistantContext({
      challengeSlug: "linux-easy-permissions-audit",
      clientContext: {
        failedTests: [{ name: "permissions output", expected: "config.yml", actual: "nothing returned" }],
        attempts: 2,
        hintLevel: 3
      }
    });
    const prompt = buildAssistantPrompt({
      mode: "debugging",
      message: "Explain my error",
      context
    });

    expect(prompt.system).toMatch(/Do not reveal full solutions/i);
    expect(prompt.contextSummary).toMatch(/permissions output/i);
    expect(prompt.contextSummary).toMatch(/attempts 2/i);
    expect(prompt.messages.at(-1)?.content).toBe("Explain my error");
  });
});
