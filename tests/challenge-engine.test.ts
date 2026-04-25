import { describe, expect, it } from "vitest";
import { getChallengeBySlug } from "@/lib/game/challenge-data";
import { runSafeMockJudge, validateLinuxCommandSafety, validateSqlSafety } from "@/lib/game/challenge-engine";

describe("safe mock judge", () => {
  it("passes a reasonable answer", async () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(challenge).toBeTruthy();
    const result = await runSafeMockJudge({
      challenge: challenge!,
      answer: "rg permissions ./workspace | sort -u # handle empty and duplicate paths",
      mode: "run"
    });
    expect(result.status).toBe("PASSED");
    expect(result.score).toBe(100);
  });

  it("blocks destructive shell commands", async () => {
    const challenge = getChallengeBySlug("linux-easy-permissions-audit");
    expect(validateLinuxCommandSafety("rm -rf /").ok).toBe(false);
    const result = await runSafeMockJudge({
      challenge: challenge!,
      answer: "rm -rf /",
      mode: "submit"
    });
    expect(result.status).toBe("FAILED");
    expect(result.testResults[0]?.message).toMatch(/blocked/i);
  });

  it("blocks mutating SQL in SQL challenges", async () => {
    const challenge = getChallengeBySlug("sql-easy-duplicate-transactions");
    expect(challenge).toBeTruthy();
    expect(validateSqlSafety("DROP TABLE users;").ok).toBe(false);
    const result = await runSafeMockJudge({
      challenge: challenge!,
      answer: "DROP TABLE users;",
      mode: "run"
    });
    expect(result.status).toBe("FAILED");
    expect(result.testResults[0]?.name).toMatch(/sql guard/i);
  });

  it("requires deterministic SQL structure", async () => {
    const challenge = getChallengeBySlug("sql-easy-duplicate-transactions");
    const result = await runSafeMockJudge({
      challenge: challenge!,
      answer:
        "SELECT user_id, COUNT(*) AS duplicate_count FROM events WHERE event_type = 'checkout' GROUP BY user_id HAVING COUNT(*) > 1 ORDER BY duplicate_count DESC, user_id ASC;",
      mode: "submit"
    });
    expect(result.status).toBe("PASSED");
    expect(result.score).toBe(100);
  });
});
