import type { ChallengeFilters, GeneratedChallenge, ProgressStatus } from "./types";

export function filterChallenges(
  challenges: GeneratedChallenge[],
  filters: ChallengeFilters,
  progress: Record<string, ProgressStatus> = {}
) {
  const query = filters.query?.trim().toLowerCase();
  return challenges.filter((challenge) => {
    if (query) {
      const haystack = [
        challenge.title,
        challenge.description,
        challenge.categorySlug,
        challenge.difficulty,
        challenge.type,
        ...challenge.tags
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.category && filters.category !== "all" && challenge.categorySlug !== filters.category) {
      return false;
    }

    if (filters.difficulty && filters.difficulty !== "all" && challenge.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.type && filters.type !== "all" && challenge.type !== filters.type) {
      return false;
    }

    if (filters.status && filters.status !== "all" && (progress[challenge.slug] ?? "NOT_STARTED") !== filters.status) {
      return false;
    }

    if (filters.tag && filters.tag !== "all" && !challenge.tags.includes(filters.tag)) {
      return false;
    }

    const minXp = filters.minXp ? Number(filters.minXp) : Number.NaN;
    if (Number.isFinite(minXp) && challenge.xpReward < minXp) {
      return false;
    }

    const maxXp = filters.maxXp ? Number(filters.maxXp) : Number.NaN;
    if (Number.isFinite(maxXp) && challenge.xpReward > maxXp) {
      return false;
    }

    return true;
  });
}
