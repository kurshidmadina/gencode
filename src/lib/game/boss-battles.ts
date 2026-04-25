import type { CategorySlug, Difficulty } from "./types";

export type BossBattleStageDefinition = {
  title: string;
  challengeSlug?: string;
  instructions: string;
  validation: {
    requiredSignals: string[];
    scoring: string;
  };
};

export type BossBattleDefinition = {
  slug: string;
  name: string;
  description: string;
  story: string;
  categorySlug: CategorySlug;
  difficulty: Difficulty;
  xpReward: number;
  coinReward: number;
  badgeReward: string;
  estimatedTime: number;
  unlockRules: {
    requiredCompletions: number;
    categories: CategorySlug[];
    minimumDifficulty?: Difficulty;
  };
  stages: BossBattleStageDefinition[];
};

export const bossBattles: BossBattleDefinition[] = [
  {
    slug: "linux-log-forensics-boss",
    name: "Linux Log Forensics Boss",
    description: "A multi-stage shell incident where permissions, logs, process state, and disk pressure collide.",
    story: "The arena host is degrading. You must reconstruct the failure timeline without mutating production state.",
    categorySlug: "linux",
    difficulty: "EXTREME",
    xpReward: 900,
    coinReward: 180,
    badgeReward: "Kernel Monk",
    estimatedTime: 75,
    unlockRules: { requiredCompletions: 12, categories: ["linux", "bash", "cli-productivity"], minimumDifficulty: "MEDIUM" },
    stages: [
      {
        title: "Preserve evidence",
        challengeSlug: "linux-hard-journal-triage",
        instructions: "Extract service failures in a stable time window and collapse noisy repeated stack traces.",
        validation: { requiredSignals: ["journalctl", "time-window", "stable-summary"], scoring: "30% timeline accuracy" }
      },
      {
        title: "Find pressure",
        challengeSlug: "linux-extreme-disk-pressure",
        instructions: "Identify the mount and largest safe cleanup candidates without crossing filesystems.",
        validation: { requiredSignals: ["df", "du -x", "sort"], scoring: "30% safe disk triage" }
      },
      {
        title: "Explain blast radius",
        challengeSlug: "bash-hard-awk-metrics",
        instructions: "Summarize affected routes or services from raw logs and describe the safest next action.",
        validation: { requiredSignals: ["awk", "grouping", "rollback-note"], scoring: "40% incident explanation" }
      }
    ]
  },
  {
    slug: "sql-fraud-detection-boss",
    name: "SQL Fraud Detection Boss",
    description: "Investigate duplicate payments, suspicious cohorts, and ranking anomalies with read-only SQL.",
    story: "Finance sees unusual retry behavior. Your query pack must be deterministic enough to send to auditors.",
    categorySlug: "sql",
    difficulty: "HARD",
    xpReward: 820,
    coinReward: 160,
    badgeReward: "SQL Knight",
    estimatedTime: 70,
    unlockRules: { requiredCompletions: 10, categories: ["sql"], minimumDifficulty: "MEDIUM" },
    stages: [
      {
        title: "Detect duplicate charges",
        challengeSlug: "sql-hard-duplicate-transactions",
        instructions: "Group suspicious transactions by user/order and sort ties deterministically.",
        validation: { requiredSignals: ["GROUP BY", "HAVING", "ORDER BY"], scoring: "35% duplicate precision" }
      },
      {
        title: "Rank risk accounts",
        challengeSlug: "sql-hard-window-ranking",
        instructions: "Use window functions to rank risky users while preserving stable tie breakers.",
        validation: { requiredSignals: ["window function", "partition", "tie-breaker"], scoring: "30% ranking correctness" }
      },
      {
        title: "Explain query plan",
        challengeSlug: "sql-extreme-query-plan-index",
        instructions: "Recommend the smallest useful index and explain why low-cardinality columns are not enough.",
        validation: { requiredSignals: ["selectivity", "composite-index", "read-only"], scoring: "35% performance reasoning" }
      }
    ]
  },
  {
    slug: "dsa-graph-dungeon-boss",
    name: "DSA Graph Dungeon Boss",
    description: "A late-stage algorithm battle across connectivity, shortest paths, and dependency ordering.",
    story: "The dungeon doors are services. Unlock the route by proving graph invariants under adversarial inputs.",
    categorySlug: "algorithms",
    difficulty: "EXTREME",
    xpReward: 950,
    coinReward: 190,
    badgeReward: "Algorithm Hunter",
    estimatedTime: 85,
    unlockRules: { requiredCompletions: 14, categories: ["algorithms", "data-structures"], minimumDifficulty: "HARD" },
    stages: [
      {
        title: "Connect components",
        challengeSlug: "data-structures-hard-graph-union-find",
        instructions: "Maintain path-compressed connectivity and report component counts after repairs.",
        validation: { requiredSignals: ["find", "union", "path compression"], scoring: "30% invariant stability" }
      },
      {
        title: "Route latency",
        challengeSlug: "algorithms-hard-dijkstra-latency",
        instructions: "Find the shortest positive-weight route and ignore stale heap entries.",
        validation: { requiredSignals: ["priority queue", "stale entries", "relaxation"], scoring: "35% graph correctness" }
      },
      {
        title: "Resolve deploy order",
        challengeSlug: "algorithms-insane-toposort-deploy",
        instructions: "Emit a stable deploy order or prove the dependency graph contains a cycle.",
        validation: { requiredSignals: ["indegree", "queue", "cycle"], scoring: "35% dependency reasoning" }
      }
    ]
  },
  {
    slug: "api-debugging-boss",
    name: "API Debugging Boss",
    description: "Fix a distributed API incident involving signatures, retries, rate limits, and compatibility.",
    story: "A public integration is timing out, retrying, and accepting suspicious webhook traffic. Keep clients whole.",
    categorySlug: "apis",
    difficulty: "HARD",
    xpReward: 860,
    coinReward: 172,
    badgeReward: "Backend Sentinel",
    estimatedTime: 72,
    unlockRules: { requiredCompletions: 12, categories: ["apis", "security", "system-design"], minimumDifficulty: "MEDIUM" },
    stages: [
      {
        title: "Verify webhook trust",
        challengeSlug: "apis-hard-webhook-signature",
        instructions: "Validate HMAC signatures over raw body with replay protection.",
        validation: { requiredSignals: ["hmac", "timestamp", "raw-body"], scoring: "35% trust boundary" }
      },
      {
        title: "Design safe retries",
        challengeSlug: "apis-medium-idempotency-key",
        instructions: "Prevent duplicate state changes when clients retry after timeouts.",
        validation: { requiredSignals: ["idempotency", "request-hash", "conflict"], scoring: "30% retry safety" }
      },
      {
        title: "Return actionable limits",
        challengeSlug: "apis-extreme-rate-limit-envelope",
        instructions: "Shape 429 responses so clients can back off without guessing.",
        validation: { requiredSignals: ["retry-after", "quota", "request-id"], scoring: "35% client contract" }
      }
    ]
  },
  {
    slug: "git-disaster-recovery-boss",
    name: "Git Disaster Recovery Boss",
    description: "Recover a damaged branch, isolate a regression, and prepare a clean release trail.",
    story: "The release branch is tangled with local edits, a regression, and a questionable tag. Save the launch.",
    categorySlug: "git",
    difficulty: "HARD",
    xpReward: 760,
    coinReward: 150,
    badgeReward: "Git Survivor",
    estimatedTime: 65,
    unlockRules: { requiredCompletions: 8, categories: ["git", "cli-productivity"], minimumDifficulty: "MEDIUM" },
    stages: [
      {
        title: "Protect unfinished work",
        challengeSlug: "git-medium-stash-worktree",
        instructions: "Move local changes aside safely and create a hotfix lane.",
        validation: { requiredSignals: ["stash", "worktree", "untracked"], scoring: "30% local safety" }
      },
      {
        title: "Isolate the bad commit",
        challengeSlug: "git-hard-bisect-regression",
        instructions: "Run a deterministic bisect and inspect the first failing commit.",
        validation: { requiredSignals: ["bisect", "test command", "first bad"], scoring: "35% regression isolation" }
      },
      {
        title: "Verify release tag",
        challengeSlug: "git-hard-release-tag",
        instructions: "Prove the tag points at reviewed history and document ancestry.",
        validation: { requiredSignals: ["tag", "signature", "ancestry"], scoring: "35% release hygiene" }
      }
    ]
  },
  {
    slug: "full-stack-bug-hunt-boss",
    name: "Full-Stack Bug Hunt Boss",
    description: "A cross-layer debugging mission through frontend state, API boundaries, and flaky test fallout.",
    story: "A user-facing workflow is failing only sometimes. You must reproduce, isolate, patch, and leave tests.",
    categorySlug: "debugging",
    difficulty: "EXTREME",
    xpReward: 940,
    coinReward: 188,
    badgeReward: "Bug Slayer",
    estimatedTime: 82,
    unlockRules: { requiredCompletions: 12, categories: ["debugging", "javascript", "typescript"], minimumDifficulty: "HARD" },
    stages: [
      {
        title: "Reproduce the race",
        challengeSlug: "debugging-hard-race-condition",
        instructions: "Shrink concurrent saves to a deterministic failure and state the expected ordering.",
        validation: { requiredSignals: ["reproduction", "request-id", "version"], scoring: "30% repro quality" }
      },
      {
        title: "Patch the boundary",
        challengeSlug: "typescript-hard-type-narrowing",
        instructions: "Narrow unsafe payloads before they enter application state.",
        validation: { requiredSignals: ["unknown", "type guard", "runtime validation"], scoring: "35% patch quality" }
      },
      {
        title: "Lock the regression",
        challengeSlug: "debugging-hard-flaky-test",
        instructions: "Add deterministic tests that fail before the fix and clean up shared state.",
        validation: { requiredSignals: ["fake timers", "cleanup", "isolation"], scoring: "35% regression safety" }
      }
    ]
  },
  {
    slug: "insane-algorithm-gauntlet-boss",
    name: "Insane Algorithm Gauntlet",
    description: "The late-game boss: scale, adversarial cases, and proof-quality explanations across multiple domains.",
    story: "The final arena mixes graphs, caches, DP, API pressure, and incident tradeoffs. Only clean reasoning clears it.",
    categorySlug: "algorithms",
    difficulty: "INSANE",
    xpReward: 1400,
    coinReward: 300,
    badgeReward: "Insane Architect",
    estimatedTime: 120,
    unlockRules: { requiredCompletions: 30, categories: ["algorithms", "data-structures", "sql", "system-design"], minimumDifficulty: "EXTREME" },
    stages: [
      {
        title: "Evict under pressure",
        challengeSlug: "data-structures-insane-lru-cache",
        instructions: "Implement O(1) get/put behavior and prove eviction invariants.",
        validation: { requiredSignals: ["hash map", "linked list", "capacity"], scoring: "25% data structure correctness" }
      },
      {
        title: "Choose optimal modules",
        challengeSlug: "algorithms-insane-dp-budget",
        instructions: "Optimize training value under a fixed budget and reconstruct the chosen set.",
        validation: { requiredSignals: ["dp", "state compression", "reconstruction"], scoring: "25% optimization" }
      },
      {
        title: "Defend the system",
        challengeSlug: "system-design-insane-rate-limiter",
        instructions: "Design a tenant-isolated limiter that handles drift, bursts, and edge distribution.",
        validation: { requiredSignals: ["sliding window", "tokens", "tenant isolation"], scoring: "25% architecture reasoning" }
      },
      {
        title: "Explain the final tradeoff",
        challengeSlug: "security-insane-rate-limit-abuse-path",
        instructions: "Close bypass paths without creating unfair lockouts for legitimate users.",
        validation: { requiredSignals: ["identity key", "ip fallback", "abuse"], scoring: "25% security judgment" }
      }
    ]
  }
];

export function getBossBattle(slug: string) {
  return bossBattles.find((boss) => boss.slug === slug) ?? null;
}
