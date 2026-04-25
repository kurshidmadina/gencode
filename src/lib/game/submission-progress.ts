import type { CategorySlug, Difficulty, ProgressStatus } from "@/lib/game/types";

export const difficultyPower: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXTREME: 4,
  INSANE: 5
};

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function startOfWeek(date: Date) {
  const dayOffset = (date.getDay() + 6) % 7;
  const start = startOfDay(date);
  start.setDate(start.getDate() - dayOffset);
  return start;
}

export function asCriteriaRecord(criteria: unknown): Record<string, unknown> {
  if (!criteria || typeof criteria !== "object" || Array.isArray(criteria)) return {};
  return criteria as Record<string, unknown>;
}

export function questGoal(criteria: Record<string, unknown>) {
  const explicit = Number(criteria.count ?? criteria.goal ?? 1);
  return Number.isFinite(explicit) && explicit > 0 ? explicit : 1;
}

export function questMatchesCompletion({
  criteria,
  categorySlug,
  difficulty,
  usedHints
}: {
  criteria: Record<string, unknown>;
  categorySlug: CategorySlug;
  difficulty: Difficulty;
  usedHints: number;
}) {
  if (typeof criteria.category === "string" && criteria.category !== categorySlug) return false;
  if (Array.isArray(criteria.categories) && !criteria.categories.includes(categorySlug)) return false;
  if (typeof criteria.difficulty === "string" && criteria.difficulty !== difficulty) return false;
  if (typeof criteria.minDifficulty === "string") {
    const minimum = difficultyPower[criteria.minDifficulty as Difficulty];
    if (!minimum || difficultyPower[difficulty] < minimum) return false;
  }
  if (typeof criteria.hintsUsed === "number" && usedHints !== criteria.hintsUsed) return false;
  if (criteria.pathMilestone || criteria.bossClears || criteria.unlockBoss) return false;
  return true;
}

export function resolveProgressStatus({
  resultStatus,
  existingStatus
}: {
  resultStatus: "PASSED" | "FAILED" | "PARTIAL";
  existingStatus?: ProgressStatus | string | null;
}): ProgressStatus {
  if (resultStatus === "PASSED" || existingStatus === "COMPLETED") return "COMPLETED";
  return "IN_PROGRESS";
}

export function resolveBestScore(existingBestScore: number | null | undefined, resultScore: number) {
  return Math.max(existingBestScore ?? 0, resultScore);
}
