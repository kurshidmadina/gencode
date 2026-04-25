import type { GeneratedChallenge } from "@/lib/game/types";
import type { JudgeResult } from "@/lib/game/challenge-engine";

export type RunnerMode = "run" | "submit";

export type RunnerInput = {
  challenge: GeneratedChallenge;
  answer: string;
  mode: RunnerMode;
  userId?: string | null;
  requestId?: string;
};

export type ChallengeRunner = {
  name: string;
  run(input: RunnerInput): Promise<JudgeResult>;
};

