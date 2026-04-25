import { runSafeMockJudge } from "@/lib/game/challenge-engine";
import type { ChallengeRunner } from "@/lib/runner/types";

export class MockChallengeRunner implements ChallengeRunner {
  name = "mock-safe-runner";

  async run(input: Parameters<ChallengeRunner["run"]>[0]) {
    return runSafeMockJudge({
      challenge: input.challenge,
      answer: input.answer,
      mode: input.mode
    });
  }
}

