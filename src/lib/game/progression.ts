import type { Difficulty } from "@/lib/game/types";

export const rankBands = [
  { minLevel: 1, name: "Newbie Spark" },
  { minLevel: 3, name: "Terminal Rookie" },
  { minLevel: 6, name: "Query Knight" },
  { minLevel: 10, name: "Code Warrior" },
  { minLevel: 15, name: "Algorithm Hunter" },
  { minLevel: 20, name: "Debug Samurai" },
  { minLevel: 26, name: "System Slayer" },
  { minLevel: 34, name: "Kernel Master" },
  { minLevel: 44, name: "Gencode Legend" },
  { minLevel: 60, name: "Insane Architect" }
] as const;

export const difficultyXp: Record<Difficulty, number> = {
  EASY: 100,
  MEDIUM: 180,
  HARD: 320,
  EXTREME: 520,
  INSANE: 850
};

export const unlockRequirements: Record<Difficulty, Partial<Record<Difficulty, number>>> = {
  EASY: {},
  MEDIUM: { EASY: 8 },
  HARD: { MEDIUM: 10 },
  EXTREME: { HARD: 8 },
  INSANE: { EXTREME: 6 }
};

export function getLevelForXp(xp: number) {
  let level = 1;
  let remaining = Math.max(0, xp);
  let nextLevelCost = xpForNextLevel(level);

  while (remaining >= nextLevelCost) {
    remaining -= nextLevelCost;
    level += 1;
    nextLevelCost = xpForNextLevel(level);
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: nextLevelCost,
    progressPercent: Math.round((remaining / nextLevelCost) * 100)
  };
}

export function xpForNextLevel(level: number) {
  return 220 + Math.floor(level ** 1.55 * 85);
}

export function getRankName(level: number) {
  return [...rankBands].reverse().find((rank) => level >= rank.minLevel)?.name ?? rankBands[0].name;
}

export function canUnlockDifficulty(
  difficulty: Difficulty,
  completions: Partial<Record<Difficulty, number>>
) {
  const requirements = unlockRequirements[difficulty];
  return Object.entries(requirements).every(([requiredDifficulty, count]) => {
    return (completions[requiredDifficulty as Difficulty] ?? 0) >= (count ?? 0);
  });
}

export function calculateSubmissionRewards({
  difficulty,
  score,
  usedHints,
  firstCompletion
}: {
  difficulty: Difficulty;
  score: number;
  usedHints: number;
  firstCompletion: boolean;
}) {
  if (!firstCompletion) {
    return { xp: 0, coins: Math.max(1, Math.round(score / 20)) };
  }

  const base = difficultyXp[difficulty];
  const hintPenalty = Math.min(0.35, usedHints * 0.08);
  const scoreMultiplier = Math.max(0.2, Math.min(1, score / 100));
  const xp = Math.round(base * scoreMultiplier * (1 - hintPenalty));
  const coins = Math.max(5, Math.round(xp / 12));

  return { xp, coins };
}

export function calculateStreak(lastActiveAt: Date | null | undefined, currentStreak: number, now = new Date()) {
  if (!lastActiveAt) return 1;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfLastActive = new Date(
    lastActiveAt.getFullYear(),
    lastActiveAt.getMonth(),
    lastActiveAt.getDate()
  ).getTime();
  const days = Math.round((startOfToday - startOfLastActive) / 86_400_000);

  if (days <= 0) return currentStreak;
  if (days === 1) return currentStreak + 1;
  return 1;
}
