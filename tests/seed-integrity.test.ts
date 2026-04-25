import { describe, expect, it } from "vitest";
import { bossBattles } from "@/lib/game/boss-battles";
import { challengeCatalog, getChallengeBySlug } from "@/lib/game/challenge-data";
import { learningPaths } from "@/lib/game/learning-paths";
import { categories, challengeTypes, difficulties, type ChallengeType } from "@/lib/game/types";

const distributionTarget = {
  EASY: 140,
  MEDIUM: 140,
  HARD: 100,
  EXTREME: 70,
  INSANE: 50
} as const;

const requestedPathNames = [
  "Linux Survival Path",
  "Linux Forensics Path",
  "SQL Analyst Path",
  "SQL Optimization Path",
  "DSA Interview Path",
  "Graph Algorithms Path",
  "Python Problem Solver Path",
  "JavaScript Debugger Path",
  "Git Recovery Path",
  "Backend API Path",
  "Regex Mastery Path",
  "System Design Foundations Path",
  "DevOps Command Line Path",
  "Insane Algorithm Arena"
];

describe("challenge seed integrity", () => {
  it("ships a large, unique, distributed library", () => {
    expect(challengeCatalog.length).toBeGreaterThanOrEqual(500);
    expect(new Set(challengeCatalog.map((challenge) => challenge.slug)).size).toBe(challengeCatalog.length);

    for (const difficulty of difficulties) {
      expect(challengeCatalog.filter((challenge) => challenge.difficulty === difficulty).length).toBeGreaterThanOrEqual(
        distributionTarget[difficulty]
      );
    }

    for (const category of categories) {
      const categoryChallenges = challengeCatalog.filter((challenge) => challenge.categorySlug === category.slug);
      expect(categoryChallenges.length, category.slug).toBeGreaterThanOrEqual(25);
      expect(new Set(categoryChallenges.map((challenge) => challenge.difficulty)).size, category.slug).toBeGreaterThanOrEqual(3);
    }

    for (const type of challengeTypes) {
      expect(challengeCatalog.some((challenge) => challenge.type === type), type).toBe(true);
    }
  });

  it("requires rich learning and validation metadata for every challenge", () => {
    for (const challenge of challengeCatalog) {
      expect(challenge.title, challenge.slug).toBeTruthy();
      expect(challenge.story.length, challenge.slug).toBeGreaterThan(40);
      expect(challenge.learningObjective.length, challenge.slug).toBeGreaterThan(40);
      expect(challenge.instructions.length, challenge.slug).toBeGreaterThan(40);
      expect(challenge.xpReward, challenge.slug).toBeGreaterThan(0);
      expect(challenge.coinReward, challenge.slug).toBeGreaterThan(0);
      expect(challenge.explanation.length, challenge.slug).toBeGreaterThan(40);
      expect(challenge.hints.length, challenge.slug).toBeGreaterThanOrEqual(3);
      expect(challenge.solution, challenge.slug).toBeTruthy();
      expect(challenge.testCases.length, challenge.slug).toBeGreaterThan(0);
      expect(challenge.hiddenTestCases.length, challenge.slug).toBeGreaterThan(0);
      expect(challenge.validationMetadata.kind, challenge.slug).toBe(challenge.type);
      expect(challenge.relatedChallenges.length, challenge.slug).toBeGreaterThan(0);
      for (const relatedSlug of challenge.relatedChallenges) {
        expect(getChallengeBySlug(relatedSlug), `${challenge.slug} related ${relatedSlug}`).toBeTruthy();
      }
    }
  });

  it("enforces type-specific validation contracts", () => {
    const byType = (type: ChallengeType) => challengeCatalog.filter((challenge) => challenge.type === type);

    for (const challenge of byType("SQL")) {
      expect(challenge.validationMetadata.sql?.schema, challenge.slug).toBeTruthy();
      expect(challenge.validationMetadata.sql?.forbiddenStatements, challenge.slug).toContain("DROP");
    }

    for (const challenge of [...byType("LINUX"), ...byType("BASH_SCRIPTING")]) {
      expect(challenge.validationMetadata.linux?.simulatedFilesystem.length, challenge.slug).toBeGreaterThan(0);
      expect(challenge.validationMetadata.linux?.forbiddenOperations.length, challenge.slug).toBeGreaterThan(0);
    }

    for (const challenge of byType("GIT_WORKFLOW")) {
      expect(challenge.validationMetadata.git?.initialRepoState, challenge.slug).toBeTruthy();
      expect(challenge.validationMetadata.git?.requiredFinalState, challenge.slug).toBeTruthy();
    }

    for (const challenge of [...byType("CODING"), ...byType("FILL_IN_CODE"), ...byType("ALGORITHM_TRACING"), ...byType("DATA_STRUCTURE_VISUALIZATION")]) {
      expect(challenge.validationMetadata.code?.edgeCases.length, challenge.slug).toBeGreaterThan(0);
      expect(challenge.validationMetadata.code?.expectedComplexity, challenge.slug).toBeTruthy();
    }

    for (const challenge of [...byType("MULTIPLE_CHOICE"), ...byType("OUTPUT_PREDICTION"), ...byType("BOSS_STAGE")]) {
      expect(challenge.validationMetadata.multipleChoice?.options.length, challenge.slug).toBe(4);
      expect(challenge.validationMetadata.multipleChoice?.correctAnswer, challenge.slug).toBeTruthy();
    }

    for (const challenge of [...byType("DEBUGGING"), ...byType("SECURITY_DEBUGGING")]) {
      expect(challenge.validationMetadata.debugging?.brokenCode, challenge.slug).toBeTruthy();
      expect(challenge.validationMetadata.debugging?.regressionTests.length, challenge.slug).toBeGreaterThan(0);
    }
  });

  it("keeps learning paths and boss battles connected to real challenge content", () => {
    for (const name of requestedPathNames) {
      expect(learningPaths.some((path) => path.name === name), name).toBe(true);
    }

    for (const path of learningPaths) {
      expect(path.challengeSlugs.length, path.slug).toBeGreaterThanOrEqual(8);
      expect(path.milestones.length, path.slug).toBeGreaterThanOrEqual(3);
      expect(path.badgeReward, path.slug).toBeTruthy();
      expect(bossBattles.some((boss) => boss.slug === path.finalBossSlug), path.slug).toBe(true);
      for (const slug of path.challengeSlugs) {
        expect(getChallengeBySlug(slug), `${path.slug} -> ${slug}`).toBeTruthy();
      }
    }

    for (const boss of bossBattles) {
      expect(boss.stages.length, boss.slug).toBeGreaterThanOrEqual(3);
      for (const stage of boss.stages) {
        expect(stage.validation.requiredSignals.length, `${boss.slug} -> ${stage.title}`).toBeGreaterThan(0);
        if (stage.challengeSlug) expect(getChallengeBySlug(stage.challengeSlug), `${boss.slug} -> ${stage.challengeSlug}`).toBeTruthy();
      }
    }
  });
});
