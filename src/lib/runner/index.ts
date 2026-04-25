import { getServerEnv } from "@/lib/env";
import { MockChallengeRunner } from "@/lib/runner/mock-runner";
import type { ChallengeRunner } from "@/lib/runner/types";

let runner: ChallengeRunner | null = null;

export function getChallengeRunner(): ChallengeRunner {
  if (runner) return runner;

  const env = getServerEnv();
  if (env.RUNNER_PROVIDER === "remote") {
    // Production runner contract is intentionally isolated from the app process.
    // Until the external runner service is deployed, fail closed to the safe mock.
    runner = new MockChallengeRunner();
    return runner;
  }

  runner = new MockChallengeRunner();
  return runner;
}

