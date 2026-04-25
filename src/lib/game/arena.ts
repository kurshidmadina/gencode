import type { CategorySlug, Difficulty } from "./types";

export type ArenaMode = {
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  categories: CategorySlug[];
  difficulties: Difficulty[];
  rules: string[];
  rewards: { xp: number; coins: number };
};

export const arenaModes: ArenaMode[] = [
  {
    slug: "sql-sprint-10",
    name: "10-minute SQL Sprint",
    description: "A fast read-only query gauntlet built for analysts and backend engineers.",
    durationMinutes: 10,
    categories: ["sql"],
    difficulties: ["EASY", "MEDIUM"],
    rules: ["Read-only SQL only", "Deterministic ordering earns a bonus", "No destructive statements"],
    rewards: { xp: 220, coins: 45 }
  },
  {
    slug: "linux-command-15",
    name: "15-minute Linux Command Sprint",
    description: "Shell incident drills with safe pipelines, quoting, and log-reading pressure.",
    durationMinutes: 15,
    categories: ["linux", "bash", "cli-productivity"],
    difficulties: ["EASY", "MEDIUM", "HARD"],
    rules: ["No host execution", "Simulated terminal only", "Null-safe path handling earns a bonus"],
    rewards: { xp: 260, coins: 55 }
  },
  {
    slug: "dsa-30",
    name: "30-minute DSA Arena",
    description: "Algorithm and data-structure reps scored by correctness, edge cases, and explanation quality.",
    durationMinutes: 30,
    categories: ["algorithms", "data-structures"],
    difficulties: ["MEDIUM", "HARD"],
    rules: ["State complexity", "Handle edge cases", "No unsafe dynamic execution"],
    rewards: { xp: 420, coins: 80 }
  },
  {
    slug: "debugging-speedrun",
    name: "Debugging Speedrun",
    description: "Reproduce, isolate, patch, and explain failures before the arena clock expires.",
    durationMinutes: 20,
    categories: ["debugging", "javascript", "typescript", "security"],
    difficulties: ["MEDIUM", "HARD"],
    rules: ["Smallest reproduction first", "Regression test required", "Secret-looking content is blocked"],
    rewards: { xp: 360, coins: 70 }
  },
  {
    slug: "mixed-gauntlet",
    name: "Mixed Technical Gauntlet",
    description: "A cross-skill challenge run for people who want the whole developer gym in one session.",
    durationMinutes: 25,
    categories: ["linux", "sql", "algorithms", "apis", "debugging", "devops"],
    difficulties: ["EASY", "MEDIUM", "HARD"],
    rules: ["Score blends accuracy and speed", "No-hint clears earn extra coins", "Unlocked challenges are prioritized"],
    rewards: { xp: 500, coins: 95 }
  }
];

export function scoreArenaRun({
  correct,
  attempted,
  secondsRemaining,
  hintsUsed
}: {
  correct: number;
  attempted: number;
  secondsRemaining: number;
  hintsUsed: number;
}) {
  const accuracy = attempted === 0 ? 0 : correct / attempted;
  const accuracyScore = Math.round(accuracy * 700);
  const speedBonus = Math.min(180, Math.max(0, Math.round(secondsRemaining / 4)));
  const noHintBonus = hintsUsed === 0 && correct > 0 ? 120 : Math.max(0, 80 - hintsUsed * 20);
  return {
    score: accuracyScore + speedBonus + noHintBonus + correct * 35,
    accuracy: Math.round(accuracy * 100),
    speedBonus,
    noHintBonus
  };
}
