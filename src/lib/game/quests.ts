import type { Difficulty } from "@/lib/game/types";

export type QuestDefinition = {
  criteria: {
    category?: string;
    difficulty?: Difficulty;
    minDifficulty?: Difficulty;
    hintsUsed?: number;
    count?: number;
    streakMaintained?: boolean;
  };
};

export type QuestEvent = {
  category: string;
  difficulty: Difficulty;
  hintsUsed: number;
  streakMaintained: boolean;
};

const difficultyOrder: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
  EXTREME: 4,
  INSANE: 5
};

export function questEventMatches(quest: QuestDefinition, event: QuestEvent) {
  const criteria = quest.criteria;
  if (criteria.category && criteria.category !== event.category) return false;
  if (criteria.difficulty && criteria.difficulty !== event.difficulty) return false;
  if (criteria.minDifficulty && difficultyOrder[event.difficulty] < difficultyOrder[criteria.minDifficulty]) return false;
  if (criteria.hintsUsed !== undefined && event.hintsUsed !== criteria.hintsUsed) return false;
  if (criteria.streakMaintained !== undefined && event.streakMaintained !== criteria.streakMaintained) return false;
  return true;
}
