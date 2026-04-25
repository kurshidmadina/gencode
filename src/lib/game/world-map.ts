import type { CategorySlug } from "./types";

export type WorldZone = {
  slug: string;
  name: string;
  description: string;
  categorySlugs: CategorySlug[];
  x: number;
  y: number;
  state: "open" | "locked" | "boss" | "legendary";
  href: string;
};

export const worldZones: WorldZone[] = [
  {
    slug: "beginner-zone",
    name: "Spawn Terminal",
    description: "The beginner zone where Easy missions build first wins.",
    categorySlugs: ["linux", "sql", "python"],
    x: 12,
    y: 58,
    state: "open",
    href: "/challenges?difficulty=EASY"
  },
  {
    slug: "linux-zone",
    name: "Kernel District",
    description: "Permissions, processes, logs, sockets, shell scripts, and incident drills.",
    categorySlugs: ["linux", "bash", "cli-productivity"],
    x: 28,
    y: 34,
    state: "open",
    href: "/paths/linux-survival"
  },
  {
    slug: "sql-zone",
    name: "Query Citadel",
    description: "Cohorts, windows, indexing, recursion, and fraud investigation missions.",
    categorySlugs: ["sql"],
    x: 42,
    y: 68,
    state: "open",
    href: "/paths/sql-analyst"
  },
  {
    slug: "dsa-zone",
    name: "Algorithm Wilds",
    description: "Binary search, heaps, graphs, dynamic programming, caches, and proof practice.",
    categorySlugs: ["algorithms", "data-structures"],
    x: 58,
    y: 28,
    state: "open",
    href: "/paths/dsa-interview"
  },
  {
    slug: "debugging-zone",
    name: "Bug Labyrinth",
    description: "Race conditions, flaky tests, memory leaks, traces, and full-stack bug hunts.",
    categorySlugs: ["debugging", "javascript", "typescript"],
    x: 68,
    y: 58,
    state: "open",
    href: "/paths/javascript-debugger"
  },
  {
    slug: "backend-zone",
    name: "API Foundry",
    description: "Contracts, idempotency, webhooks, rate limits, security, and backend resilience.",
    categorySlugs: ["apis", "security", "system-design"],
    x: 78,
    y: 36,
    state: "open",
    href: "/paths/backend-api"
  },
  {
    slug: "boss-arenas",
    name: "Boss Arenas",
    description: "Multi-stage fights that test whether your skills survive realistic pressure.",
    categorySlugs: ["linux", "sql", "algorithms", "git", "apis"],
    x: 48,
    y: 14,
    state: "boss",
    href: "/boss-battles"
  },
  {
    slug: "insane-realm",
    name: "Insane Realm",
    description: "Late-game gauntlets for adversarial inputs, scale, and architecture judgment.",
    categorySlugs: ["algorithms", "data-structures", "system-design", "security"],
    x: 88,
    y: 16,
    state: "legendary",
    href: "/paths/insane-algorithm-arena"
  }
];
