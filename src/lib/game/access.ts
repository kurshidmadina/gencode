import { canReachDatabase } from "@/lib/db-health";
import { canUnlockDifficulty } from "@/lib/game/progression";
import type { Difficulty, GeneratedChallenge } from "@/lib/game/types";
import { prisma } from "@/lib/prisma";

export type ChallengeAccessState = {
  locked: boolean;
  reason: string;
  missingPrerequisites: string[];
  completedByDifficulty: Partial<Record<Difficulty, number>>;
};

export function getChallengeAccessState({
  challenge,
  completedByDifficulty = {},
  completedSlugs = new Set<string>(),
  authenticated = false
}: {
  challenge: GeneratedChallenge;
  completedByDifficulty?: Partial<Record<Difficulty, number>>;
  completedSlugs?: Set<string>;
  authenticated?: boolean;
}): ChallengeAccessState {
  const missingPrerequisites = challenge.prerequisites.filter((slug) => !completedSlugs.has(slug));
  const difficultyUnlocked = canUnlockDifficulty(challenge.difficulty, completedByDifficulty);

  if (!authenticated && challenge.difficulty !== "EASY") {
    return {
      locked: true,
      reason: "Log in and clear the lower tiers to unlock this mission.",
      missingPrerequisites,
      completedByDifficulty
    };
  }

  if (!difficultyUnlocked) {
    return {
      locked: true,
      reason: `Complete enough ${Object.keys(challenge.unlockRules.requiredCompletions).join(", ") || "lower-tier"} missions to unlock ${challenge.difficulty}.`,
      missingPrerequisites,
      completedByDifficulty
    };
  }

  if (missingPrerequisites.length > 0) {
    return {
      locked: true,
      reason: `Clear ${missingPrerequisites.length} prerequisite mission${missingPrerequisites.length === 1 ? "" : "s"} first.`,
      missingPrerequisites,
      completedByDifficulty
    };
  }

  return {
    locked: false,
    reason: "Mission unlocked.",
    missingPrerequisites: [],
    completedByDifficulty
  };
}

export async function getUserChallengeAccess(userId: string | undefined, challenge: GeneratedChallenge) {
  if (!userId || !(await canReachDatabase())) {
    return getChallengeAccessState({ challenge, authenticated: Boolean(userId) });
  }

  try {
    const completed = await prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { slug: true, difficulty: true } } }
    });

    const completedByDifficulty = completed.reduce<Partial<Record<Difficulty, number>>>((acc, item) => {
      const difficulty = item.challenge.difficulty as Difficulty;
      acc[difficulty] = (acc[difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const completedSlugs = new Set(completed.map((item) => item.challenge.slug));

    return getChallengeAccessState({
      challenge,
      completedByDifficulty,
      completedSlugs,
      authenticated: true
    });
  } catch {
    return getChallengeAccessState({ challenge, authenticated: true });
  }
}

export async function getUserChallengeAccessMap(userId: string | undefined, challenges: GeneratedChallenge[]) {
  if (!userId || !(await canReachDatabase())) {
    return Object.fromEntries(
      challenges.map((challenge) => [challenge.slug, getChallengeAccessState({ challenge, authenticated: Boolean(userId) })])
    );
  }

  try {
    const completed = await prisma.userProgress.findMany({
      where: { userId, status: "COMPLETED" },
      include: { challenge: { select: { slug: true, difficulty: true } } }
    });
    const completedByDifficulty = completed.reduce<Partial<Record<Difficulty, number>>>((acc, item) => {
      const difficulty = item.challenge.difficulty as Difficulty;
      acc[difficulty] = (acc[difficulty] ?? 0) + 1;
      return acc;
    }, {});
    const completedSlugs = new Set(completed.map((item) => item.challenge.slug));

    return Object.fromEntries(
      challenges.map((challenge) => [
        challenge.slug,
        getChallengeAccessState({ challenge, completedByDifficulty, completedSlugs, authenticated: true })
      ])
    );
  } catch {
    return Object.fromEntries(challenges.map((challenge) => [challenge.slug, getChallengeAccessState({ challenge, authenticated: true })]));
  }
}
