export type QuestDefinition = {
  slug: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "milestone" | "category" | "boss";
  cadence?: "DAILY" | "WEEKLY";
  xpReward: number;
  coinReward: number;
  goal: number;
  criteria: Record<string, string | number | boolean | string[]>;
};

export const platformQuests: QuestDefinition[] = [
  {
    slug: "daily-easy-triple",
    title: "Clear 3 Easy missions",
    description: "Stack three clean reps and keep the streak warm.",
    type: "daily",
    cadence: "DAILY",
    xpReward: 120,
    coinReward: 30,
    goal: 3,
    criteria: { difficulty: "EASY" }
  },
  {
    slug: "daily-sql-no-hint",
    title: "Solve SQL without hints",
    description: "Win a query room with your own reasoning.",
    type: "daily",
    cadence: "DAILY",
    xpReward: 150,
    coinReward: 40,
    goal: 1,
    criteria: { category: "sql", hintsUsed: 0 }
  },
  {
    slug: "weekly-linux-terminal",
    title: "Complete 5 terminal missions",
    description: "Turn shell fluency into muscle memory.",
    type: "weekly",
    cadence: "WEEKLY",
    xpReward: 420,
    coinReward: 110,
    goal: 5,
    criteria: { categories: ["linux", "bash", "cli-productivity"] }
  },
  {
    slug: "weekly-boss-scout",
    title: "Unlock a boss gate",
    description: "Complete enough prerequisite rooms to make one boss battle available.",
    type: "weekly",
    cadence: "WEEKLY",
    xpReward: 500,
    coinReward: 140,
    goal: 1,
    criteria: { unlockBoss: true }
  },
  {
    slug: "milestone-first-path",
    title: "Finish a learning path milestone",
    description: "Commit to a path long enough to change your baseline.",
    type: "milestone",
    xpReward: 700,
    coinReward: 180,
    goal: 1,
    criteria: { pathMilestone: true }
  },
  {
    slug: "boss-first-defeat",
    title: "Defeat your first boss",
    description: "Prove you can combine skills under pressure.",
    type: "boss",
    xpReward: 900,
    coinReward: 220,
    goal: 1,
    criteria: { bossClears: 1 }
  }
];
