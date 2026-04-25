import { describe, expect, it } from "vitest";
import { arenaModes, scoreArenaRun } from "@/lib/game/arena";
import { bossBattles } from "@/lib/game/boss-battles";
import { challengeCatalog, getChallengeBySlug } from "@/lib/game/challenge-data";
import { learningPaths, recommendLearningPath } from "@/lib/game/learning-paths";
import { platformQuests } from "@/lib/game/platform-quests";
import { shopItems } from "@/lib/game/shop";
import { categories, difficulties } from "@/lib/game/types";
import { parseVoiceCommand } from "@/lib/voice/commands";

describe("legendary platform systems", () => {
  it("ships at least 500 unique meaningful challenges across every category and difficulty", () => {
    expect(challengeCatalog.length).toBeGreaterThanOrEqual(500);
    expect(new Set(challengeCatalog.map((challenge) => challenge.slug)).size).toBe(challengeCatalog.length);

    for (const category of categories) {
      expect(challengeCatalog.some((challenge) => challenge.categorySlug === category.slug)).toBe(true);
    }

    for (const difficulty of difficulties) {
      expect(challengeCatalog.filter((challenge) => challenge.difficulty === difficulty).length).toBeGreaterThanOrEqual(50);
    }

    const securityChallenge = getChallengeBySlug("security-hard-ssrf-url-filter");
    expect(securityChallenge?.type).toBe("SECURITY_DEBUGGING");
    expect(securityChallenge?.hints.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps learning path and boss references resolvable", () => {
    for (const path of learningPaths) {
      expect(path.challengeSlugs.length).toBeGreaterThanOrEqual(8);
      for (const slug of path.challengeSlugs) {
        expect(getChallengeBySlug(slug), `${path.slug} -> ${slug}`).toBeTruthy();
      }
      expect(bossBattles.some((boss) => boss.slug === path.finalBossSlug)).toBe(true);
    }

    for (const boss of bossBattles) {
      expect(boss.stages.length).toBeGreaterThanOrEqual(3);
      for (const stage of boss.stages) {
        if (stage.challengeSlug) expect(getChallengeBySlug(stage.challengeSlug), `${boss.slug} -> ${stage.challengeSlug}`).toBeTruthy();
      }
    }
  });

  it("recommends calibration paths from user intent", () => {
    expect(
      recommendLearningPath({
        experienceLevel: "intermediate",
        targetGoal: "I need SQL interview practice",
        preferredCategories: ["sql"],
        weakestTopics: ["joins"],
        preferredLanguage: "sql",
        minutesPerDay: 30,
        preparingFor: "interview"
      })
    ).toBe("sql-analyst");

    expect(
      recommendLearningPath({
        experienceLevel: "advanced",
        targetGoal: "DevOps command line incidents",
        preferredCategories: ["linux", "devops"],
        weakestTopics: ["shell confidence"],
        preferredLanguage: "bash",
        minutesPerDay: 45,
        preparingFor: "job"
      })
    ).toBe("devops-command-line");
  });

  it("scores arena runs and exposes fair cosmetic/shop/quest systems", () => {
    const score = scoreArenaRun({ correct: 4, attempted: 5, secondsRemaining: 120, hintsUsed: 0 });
    expect(score.score).toBeGreaterThan(700);
    expect(arenaModes.length).toBeGreaterThanOrEqual(5);
    expect(shopItems.every((item) => item.price > 0)).toBe(true);
    expect(platformQuests.some((quest) => quest.type === "boss")).toBe(true);
  });

  it("parses voice commands for hands-free training", () => {
    expect(parseVoiceCommand("Genie, read the problem").type).toBe("READ_PROBLEM");
    expect(parseVoiceCommand("run my code").type).toBe("RUN_TESTS");
    expect(parseVoiceCommand("show my progress").type).toBe("SHOW_PROGRESS");
    expect(parseVoiceCommand("switch to interview mode")).toEqual({ type: "SWITCH_MODE", mode: "interviewer" });
    expect(parseVoiceCommand("switch to SQL review mode")).toEqual({ type: "SWITCH_MODE", mode: "sql-review" });
    expect(parseVoiceCommand("switch to dashboard").type).toBe("SHOW_DASHBOARD");
    expect(parseVoiceCommand("Genie stop speaking").type).toBe("STOP_SPEAKING");
    expect(parseVoiceCommand("exit VR").type).toBe("EXIT_VR");
  });
});
