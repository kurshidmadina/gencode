import type { CategorySlug, ChallengeType, Difficulty } from "@/lib/game/types";

export type AchievementProgress = {
  completedTotal: number;
  categoryCounts: Partial<Record<CategorySlug, number>>;
  difficultyCounts: Partial<Record<Difficulty, number>>;
  typeCounts: Partial<Record<ChallengeType, number>>;
  streak: number;
  noHintCompletions: number;
  speedCompletions: number;
  level: number;
};

export function evaluateAchievementAwards(progress: AchievementProgress) {
  const awards: string[] = [];
  if (progress.completedTotal >= 1) awards.push("first-blood");
  if ((progress.categoryCounts.sql ?? 0) >= 5) awards.push("sql-starter");
  if ((progress.categoryCounts.sql ?? 0) >= 25) awards.push("query-knight");
  if ((progress.categoryCounts.linux ?? 0) >= 10) awards.push("linux-monk");
  if ((progress.categoryCounts["data-structures"] ?? 0) + (progress.categoryCounts.algorithms ?? 0) >= 20) awards.push("dsa-climber");
  if ((progress.typeCounts.DEBUGGING ?? 0) >= 10) awards.push("debug-hunter");
  if ((progress.categoryCounts.git ?? 0) >= 10) awards.push("git-survivor");
  if ((progress.difficultyCounts.INSANE ?? 0) >= 1) awards.push("insane-survivor");
  if (progress.noHintCompletions >= 5) awards.push("no-hint-hero");
  if (progress.speedCompletions >= 1) awards.push("speed-solver");
  if (progress.streak >= 7) awards.push("seven-day-streak");
  if (progress.streak >= 30) awards.push("thirty-day-streak");
  if (progress.level >= 44 || progress.completedTotal >= 250) awards.push("gencode-legend");
  return awards;
}
