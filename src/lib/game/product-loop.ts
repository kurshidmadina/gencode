import { rankBands, getLevelForXp } from "@/lib/game/progression";

export type ProductLoopChallenge = {
  slug: string;
  title: string;
  categorySlug: string;
  difficulty: string;
  xpReward: number;
  estimatedTime?: number;
};

export type ProductLoopStats = {
  xp: number;
  level: number;
  rank: string;
  streak: number;
  completed: number;
  leaderboardRank: number;
  weakAreas: string[];
  strongAreas: string[];
  recommended: ProductLoopChallenge[];
  recommendedPath?: { slug: string; name: string; finalBossSlug?: string } | null;
};

export type ProductLoopBriefing = {
  segment: "first-session" | "builder" | "late-game";
  headline: string;
  subcopy: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  nextChallenge?: ProductLoopChallenge;
  signals: Array<{ label: string; text: string; tone: "cyan" | "gold" | "lime" | "pink" }>;
  firstTenMinutePlan: Array<{ minute: string; title: string; copy: string; href: string }>;
};

function getNextRankName(level: number) {
  return rankBands.find((rank) => rank.minLevel > level)?.name ?? "Insane Architect";
}

function getBossUnlockPressure(completed: number) {
  const bossGate = [8, 12, 20, 30].find((gate) => completed < gate);
  if (!bossGate) return "Boss gates are open. Queue an Arena sprint or enter a late-game boss battle.";
  const remaining = bossGate - completed;
  return `${remaining} more clear${remaining === 1 ? "" : "s"} puts a boss gate within reach.`;
}

export function buildProductLoopBriefing(stats: ProductLoopStats): ProductLoopBriefing {
  const level = getLevelForXp(stats.xp);
  const xpToNextLevel = Math.max(0, level.xpForNextLevel - level.xpIntoLevel);
  const nextChallenge = stats.recommended[0];
  const weakestArea = stats.weakAreas[0] ?? "the next unlocked arena";
  const strongestArea = stats.strongAreas[0] ?? "your strongest arena";
  const segment: ProductLoopBriefing["segment"] =
    stats.completed < 3 ? "first-session" : stats.completed >= 40 || stats.level >= 15 ? "late-game" : "builder";

  if (segment === "first-session") {
    return {
      segment,
      headline: "Your first 10 minutes are already mapped.",
      subcopy:
        "Start with one guided mission, run visible checks, ask Genie for one nudge, then lock in your first XP and badge progress.",
      primaryCta: { label: nextChallenge ? "Start first mission" : "Browse starter missions", href: nextChallenge ? `/challenges/${nextChallenge.slug}` : "/challenges?difficulty=EASY" },
      secondaryCta: { label: "Take calibration", href: "/onboarding/calibration" },
      nextChallenge,
      signals: [
        { label: "Beginner-safe", text: "Easy missions are open first so the arena teaches one mechanic at a time.", tone: "cyan" },
        { label: "Genie guardrails", text: "Ask for one hint without getting the whole answer dumped on you.", tone: "lime" },
        { label: "First reward", text: "Your first clear starts XP, coins, First Blood progress, and your public profile story.", tone: "gold" }
      ],
      firstTenMinutePlan: [
        { minute: "0-2", title: "Choose your target", copy: "Calibration turns goals and weak spots into a recommended path.", href: "/onboarding/calibration" },
        { minute: "2-7", title: "Clear one starter room", copy: nextChallenge ? `${nextChallenge.title} is the current best first rep.` : "Pick an Easy Linux, SQL, or Python room.", href: nextChallenge ? `/challenges/${nextChallenge.slug}` : "/challenges?difficulty=EASY" },
        { minute: "7-9", title: "Ask Genie to review", copy: "Use hint or code-review mode to understand the mistake before moving on.", href: "/dashboard" },
        { minute: "9-10", title: "Queue tomorrow", copy: "Save the next mission and protect the streak tomorrow.", href: "/dashboard" }
      ]
    };
  }

  if (segment === "late-game") {
    return {
      segment,
      headline: "You are past warmups. The arena should push back.",
      subcopy:
        "Boss battles, timed Arena runs, and weak-skill repair plans keep advanced users out of grind mode and inside real mastery pressure.",
      primaryCta: { label: "Enter Arena sprint", href: "/arena" },
      secondaryCta: { label: "Open boss battles", href: "/boss-battles" },
      nextChallenge,
      signals: [
        { label: "Late-game pressure", text: getBossUnlockPressure(stats.completed), tone: "pink" },
        { label: "Rank chase", text: `${xpToNextLevel} XP to Level ${stats.level + 1}; next rank target is ${getNextRankName(stats.level)}.`, tone: "gold" },
        { label: "Skill repair", text: `${weakestArea} is the next place Genie should make uncomfortable on purpose.`, tone: "cyan" },
        { label: "Share signal", text: `A #${stats.leaderboardRank} profile with boss clears and badges is worth showing off.`, tone: "lime" }
      ],
      firstTenMinutePlan: [
        { minute: "0-2", title: "Pick pressure", copy: "Choose Arena if you need speed, Boss if you need synthesis.", href: "/arena" },
        { minute: "2-8", title: "Run one hard rep", copy: nextChallenge ? `${nextChallenge.title} keeps the edge sharp.` : "Choose a Hard, Extreme, or Insane mission.", href: nextChallenge ? `/challenges/${nextChallenge.slug}` : "/challenges?difficulty=HARD" },
        { minute: "8-10", title: "Review like staff", copy: "Ask Genie for tradeoffs, failure modes, and what would break at scale.", href: "/dashboard" }
      ]
    };
  }

  return {
    segment,
    headline: `Your ${stats.streak}-day streak is ${stats.streak > 0 ? "alive" : "ready to start"}.`,
    subcopy:
      "Today has a clear job: finish one recommended mission, move a quest bar, and close the weakest-area gap before logging off.",
    primaryCta: { label: nextChallenge ? "Continue next mission" : "Find next mission", href: nextChallenge ? `/challenges/${nextChallenge.slug}` : "/challenges" },
    secondaryCta: { label: stats.recommendedPath ? "Open active path" : "Choose a path", href: stats.recommendedPath ? `/paths/${stats.recommendedPath.slug}` : "/paths" },
    nextChallenge,
    signals: [
      { label: "Comeback hook", text: stats.streak > 0 ? "One clear today keeps the streak alive and the dashboard warm tomorrow." : "One clear today starts your streak clock.", tone: "lime" },
      { label: "Rank pressure", text: `${xpToNextLevel} XP to Level ${stats.level + 1}; ${getNextRankName(stats.level)} is the next named identity.`, tone: "gold" },
      { label: "Weakness repair", text: `${weakestArea} is lagging; Genie can turn it into a 3-step plan.`, tone: "cyan" },
      { label: "Identity", text: `${strongestArea} is becoming part of your public operator profile.`, tone: "pink" }
    ],
    firstTenMinutePlan: [
      { minute: "0-1", title: "Read the comeback cue", copy: "Know whether today is streak, rank, boss, or weakness day.", href: "/dashboard" },
      { minute: "1-8", title: "Clear one mission", copy: nextChallenge ? `${nextChallenge.title} is queued because it advances your current loop.` : "Choose the next unlocked mission.", href: nextChallenge ? `/challenges/${nextChallenge.slug}` : "/challenges" },
      { minute: "8-10", title: "Review and queue", copy: "Ask Genie what to do tomorrow before the session ends.", href: "/dashboard" }
    ]
  };
}
