import { prisma } from "@/lib/prisma";
import { canReachDatabase } from "@/lib/db-health";
import { challengeCatalog, getChallengeBySlug } from "@/lib/game/challenge-data";
import { filterChallenges } from "@/lib/game/filtering";
import type { ChallengeFilters, GeneratedChallenge } from "@/lib/game/types";

type DbChallenge = Awaited<ReturnType<typeof prisma.challenge.findMany>>[number] & {
  category?: { slug: string; name: string };
};

function dbToGenerated(challenge: DbChallenge): GeneratedChallenge {
  return {
    slug: challenge.slug,
    title: challenge.title,
    subtitle: challenge.subtitle ?? `${challenge.difficulty} ${challenge.type.replaceAll("_", " ")} mission`,
    description: challenge.description,
    story: challenge.story,
    learningObjective: challenge.learningObjective ?? "Practice a real technical skill with clear feedback.",
    instructions: challenge.instructions,
    categorySlug: (challenge.category?.slug ?? "linux") as GeneratedChallenge["categorySlug"],
    difficulty: challenge.difficulty as GeneratedChallenge["difficulty"],
    type: challenge.type as GeneratedChallenge["type"],
    status: challenge.status as GeneratedChallenge["status"],
    tags: challenge.tags,
    prerequisites: challenge.prerequisites,
    xpReward: challenge.xpReward,
    coinReward: challenge.coinReward,
    starterCode: challenge.starterCode ?? undefined,
    language: challenge.language ?? undefined,
    testCases: Array.isArray(challenge.testCases) ? (challenge.testCases as GeneratedChallenge["testCases"]) : [],
    hiddenTestCases: Array.isArray(challenge.hiddenTestCases)
      ? (challenge.hiddenTestCases as GeneratedChallenge["hiddenTestCases"])
      : [],
    validationMetadata:
      typeof challenge.validationMetadata === "object" && challenge.validationMetadata
        ? (challenge.validationMetadata as GeneratedChallenge["validationMetadata"])
        : {
            kind: challenge.type as GeneratedChallenge["type"],
            complexityTarget: "Validation metadata is pending for this admin-created challenge."
          },
    examples: Array.isArray(challenge.examples) ? (challenge.examples as GeneratedChallenge["examples"]) : [],
    hints: challenge.hints,
    solution: challenge.solution ?? undefined,
    explanation: challenge.explanation,
    successCriteria: Array.isArray(challenge.successCriteria) ? (challenge.successCriteria as string[]) : [],
    relatedChallenges: Array.isArray(challenge.relatedChallenges) ? challenge.relatedChallenges : [],
    estimatedTime: challenge.estimatedTime,
    unlockRules:
      typeof challenge.unlockRules === "object" && challenge.unlockRules
        ? (challenge.unlockRules as GeneratedChallenge["unlockRules"])
        : { requiredCompletions: {} },
    featured: challenge.featured
  };
}

export async function listChallenges(filters: ChallengeFilters = {}) {
  if (!(await canReachDatabase())) {
    return filterChallenges(challengeCatalog, filters);
  }

  try {
    const challenges = await prisma.challenge.findMany({
      where: {
        status: "PUBLISHED"
      },
      include: {
        category: true
      },
      orderBy: [{ featured: "desc" }, { xpReward: "asc" }],
      take: 800
    });

    if (challenges.length > 0) {
      return filterChallenges(challenges.map(dbToGenerated), filters);
    }
  } catch {
    // Local first-run path: the app still renders before Postgres is started.
  }

  return filterChallenges(challengeCatalog, filters);
}

export async function findChallenge(slug: string) {
  if (!(await canReachDatabase())) {
    return getChallengeBySlug(slug);
  }

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { slug },
      include: { category: true }
    });
    if (challenge) return dbToGenerated(challenge);
  } catch {
    // Fall back to generated catalog for zero-config development.
  }

  return getChallengeBySlug(slug);
}

export async function listCategories() {
  if (!(await canReachDatabase())) {
    return null;
  }

  try {
    const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
    if (categories.length > 0) return categories;
  } catch {
    // Static fallback is handled at call sites where richer metadata is already imported.
  }
  return null;
}
