import { challengeCatalog } from "./challenge-data";
import type { CategorySlug } from "./types";

export type LearningPathDefinition = {
  slug: string;
  name: string;
  description: string;
  targetAudience: string;
  estimatedHours: number;
  categories: CategorySlug[];
  challengeSlugs: string[];
  milestones: Array<{ title: string; description: string; requiredClears: number }>;
  finalBossSlug: string;
  badgeReward: string;
};

export const learningPaths: LearningPathDefinition[] = [
  {
    slug: "linux-survival",
    name: "Linux Survival Path",
    description: "Build command-line confidence from permissions and process triage through incident-grade log forensics.",
    targetAudience: "Developers, SRE beginners, students, and anyone who freezes when production opens a shell.",
    estimatedHours: 18,
    categories: ["linux", "bash", "cli-productivity", "devops"],
    challengeSlugs: [
      "linux-easy-permissions-audit",
      "bash-easy-awk-metrics",
      "cli-productivity-easy-ripgrep-refactor",
      "linux-medium-process-forensics",
      "bash-medium-strict-mode-script",
      "linux-hard-journal-triage",
      "devops-hard-kubernetes-crashloop",
      "linux-extreme-disk-pressure"
    ],
    milestones: [
      { title: "Shell footing", description: "Read the machine without breaking it.", requiredClears: 2 },
      { title: "Incident scout", description: "Correlate logs, processes, and disk pressure.", requiredClears: 5 },
      { title: "Production calm", description: "Explain a safe response under pressure.", requiredClears: 8 }
    ],
    finalBossSlug: "linux-log-forensics-boss",
    badgeReward: "Kernel Monk"
  },
  {
    slug: "linux-forensics",
    name: "Linux Forensics Path",
    description: "Move from basic shell inspection to incident-grade evidence gathering across logs, permissions, processes, sockets, and suspicious activity.",
    targetAudience: "SRE learners, backend engineers, and security-minded operators who want practical Linux incident confidence.",
    estimatedHours: 24,
    categories: ["linux", "bash", "cli-productivity", "security"],
    challengeSlugs: [
      "linux-easy-journal-triage",
      "linux-medium-permissions-audit",
      "bash-medium-awk-metrics",
      "linux-hard-process-forensics",
      "linux-hard-journal-triage",
      "cli-productivity-hard-jq-api-triage",
      "security-hard-secret-redaction-logs",
      "linux-extreme-network-sockets"
    ],
    milestones: [
      { title: "Evidence handler", description: "Collect read-only facts without damaging the scene.", requiredClears: 2 },
      { title: "Timeline builder", description: "Correlate logs, processes, sockets, and request IDs.", requiredClears: 5 },
      { title: "Forensics operator", description: "Explain blast radius and next safe action.", requiredClears: 8 }
    ],
    finalBossSlug: "linux-log-forensics-boss",
    badgeReward: "Linux Forensics Analyst"
  },
  {
    slug: "sql-mastery",
    name: "SQL Mastery Path",
    description: "Train analytics-grade SQL: duplicates, cohorts, ranking, recursion, indexing, and fraud-style investigation.",
    targetAudience: "Analysts, backend engineers, data candidates, and anyone prepping for SQL-heavy interviews.",
    estimatedHours: 22,
    categories: ["sql"],
    challengeSlugs: [
      "sql-easy-duplicate-transactions",
      "sql-easy-window-ranking",
      "sql-medium-retention-cohorts",
      "sql-medium-query-plan-index",
      "sql-hard-window-ranking",
      "sql-hard-recursive-cte",
      "sql-extreme-query-plan-index",
      "sql-insane-duplicate-transactions"
    ],
    milestones: [
      { title: "Query blade", description: "Write deterministic read-only investigations.", requiredClears: 2 },
      { title: "Warehouse tactician", description: "Use windows, cohorts, and recursion safely.", requiredClears: 5 },
      { title: "Fraud hunter", description: "Reason about scale and correctness under noisy data.", requiredClears: 8 }
    ],
    finalBossSlug: "sql-fraud-detection-boss",
    badgeReward: "SQL Knight"
  },
  {
    slug: "sql-analyst",
    name: "SQL Analyst Path",
    description: "Build confidence with read-only investigation: duplicates, cohorts, windows, stable ordering, and audit-friendly result sets.",
    targetAudience: "Analysts, students, and backend engineers who need SQL that survives real business questions.",
    estimatedHours: 18,
    categories: ["sql"],
    challengeSlugs: [
      "sql-easy-duplicate-transactions",
      "sql-easy-retention-cohorts",
      "sql-easy-window-ranking",
      "sql-medium-duplicate-transactions",
      "sql-medium-retention-cohorts",
      "sql-medium-window-ranking",
      "sql-hard-duplicate-transactions",
      "sql-hard-retention-cohorts"
    ],
    milestones: [
      { title: "Read-only investigator", description: "Filter, group, and order results safely.", requiredClears: 2 },
      { title: "Cohort builder", description: "Join event and user data without double counting.", requiredClears: 5 },
      { title: "Analytics finisher", description: "Explain business meaning and edge cases.", requiredClears: 8 }
    ],
    finalBossSlug: "sql-fraud-detection-boss",
    badgeReward: "SQL Analyst"
  },
  {
    slug: "sql-optimization",
    name: "SQL Optimization Path",
    description: "Train query-plan judgment: composite indexes, selectivity, windows, recursion, and scale-aware aggregation.",
    targetAudience: "Backend engineers, data engineers, and senior candidates who need SQL performance instincts.",
    estimatedHours: 26,
    categories: ["sql"],
    challengeSlugs: [
      "sql-medium-query-plan-index",
      "sql-hard-query-plan-index",
      "sql-hard-window-ranking",
      "sql-extreme-query-plan-index",
      "sql-extreme-retention-cohorts",
      "sql-insane-query-plan-index",
      "sql-insane-recursive-cte",
      "sql-insane-window-ranking"
    ],
    milestones: [
      { title: "Plan reader", description: "Connect WHERE, JOIN, ORDER BY, and index shape.", requiredClears: 2 },
      { title: "Scale defender", description: "Spot cardinality traps and unstable windows.", requiredClears: 5 },
      { title: "Optimizer", description: "Explain performance tradeoffs like a production owner.", requiredClears: 8 }
    ],
    finalBossSlug: "sql-fraud-detection-boss",
    badgeReward: "Query Optimizer"
  },
  {
    slug: "dsa-interview",
    name: "DSA Interview Path",
    description: "Practice the invariants that actually win interviews: caches, heaps, graphs, binary search, DP, and topo sort.",
    targetAudience: "Interview candidates who want signal instead of random problem grinding.",
    estimatedHours: 30,
    categories: ["data-structures", "algorithms"],
    challengeSlugs: [
      "algorithms-easy-first-bad-build",
      "data-structures-easy-min-stack",
      "algorithms-medium-sliding-window-anomaly",
      "data-structures-medium-lru-cache",
      "algorithms-hard-dijkstra-latency",
      "data-structures-hard-heap-scheduler",
      "algorithms-extreme-dp-budget",
      "algorithms-insane-toposort-deploy"
    ],
    milestones: [
      { title: "Invariant scout", description: "Name the loop/data-structure invariant first.", requiredClears: 2 },
      { title: "Complexity climber", description: "Choose the right shape before coding.", requiredClears: 5 },
      { title: "Interview finisher", description: "Explain edge cases and complexity cleanly.", requiredClears: 8 }
    ],
    finalBossSlug: "dsa-graph-dungeon-boss",
    badgeReward: "Algorithm Hunter"
  },
  {
    slug: "graph-algorithms",
    name: "Graph Algorithms Path",
    description: "A focused route through graph representation, BFS/DFS reasoning, union-find, shortest paths, cycle detection, and deploy ordering.",
    targetAudience: "Interview candidates and competitive programmers who want graph confidence instead of memorized templates.",
    estimatedHours: 28,
    categories: ["algorithms", "data-structures"],
    challengeSlugs: [
      "algorithms-easy-dijkstra-latency",
      "data-structures-easy-graph-union-find",
      "algorithms-medium-dijkstra-latency",
      "algorithms-hard-dijkstra-latency",
      "data-structures-hard-graph-union-find",
      "algorithms-hard-toposort-deploy",
      "algorithms-extreme-toposort-deploy",
      "algorithms-insane-dijkstra-latency"
    ],
    milestones: [
      { title: "Graph reader", description: "Translate stories into nodes, edges, and invariants.", requiredClears: 2 },
      { title: "Traversal tactician", description: "Choose BFS/DFS/union-find/heap based on the signal.", requiredClears: 5 },
      { title: "Dungeon ready", description: "Handle cycles, stale heap entries, and adversarial graph shapes.", requiredClears: 8 }
    ],
    finalBossSlug: "dsa-graph-dungeon-boss",
    badgeReward: "Graph Runner"
  },
  {
    slug: "python-problem-solver",
    name: "Python Problem Solver Path",
    description: "Move from tidy Python scripts to async, typed, testable production helpers.",
    targetAudience: "Python learners, data engineers, backend engineers, and automation-heavy developers.",
    estimatedHours: 20,
    categories: ["python", "debugging"],
    challengeSlugs: [
      "python-easy-dataclass-parser",
      "python-easy-iterator-batches",
      "python-medium-pytest-debug",
      "python-medium-asyncio-rate-limit",
      "python-hard-typing-protocol",
      "debugging-hard-flaky-test",
      "python-extreme-asyncio-rate-limit",
      "python-insane-typing-protocol"
    ],
    milestones: [
      { title: "Python clean room", description: "Validate boundaries and stream safely.", requiredClears: 2 },
      { title: "Async operator", description: "Control concurrency and timeouts.", requiredClears: 5 },
      { title: "Test hardened", description: "Leave deterministic coverage behind.", requiredClears: 8 }
    ],
    finalBossSlug: "full-stack-bug-hunt-boss",
    badgeReward: "Python Problem Solver"
  },
  {
    slug: "javascript-debugger",
    name: "JavaScript Debugger Path",
    description: "Master async behavior, browser storage, fetch reliability, TypeScript boundaries, and UI failure analysis.",
    targetAudience: "Frontend and full-stack engineers who want sharper runtime instincts.",
    estimatedHours: 19,
    categories: ["javascript", "typescript", "debugging"],
    challengeSlugs: [
      "javascript-easy-event-loop-trace",
      "javascript-easy-array-transform",
      "typescript-easy-type-narrowing",
      "javascript-medium-fetch-retry",
      "typescript-medium-discriminated-union",
      "debugging-hard-memory-leak",
      "javascript-extreme-promise-pool",
      "typescript-insane-api-contract"
    ],
    milestones: [
      { title: "Runtime reader", description: "Predict event-loop and data-flow behavior.", requiredClears: 2 },
      { title: "Boundary shaper", description: "Turn unknown input into typed, safe state.", requiredClears: 5 },
      { title: "Failure hunter", description: "Debug the leak, retry, or stale state fast.", requiredClears: 8 }
    ],
    finalBossSlug: "full-stack-bug-hunt-boss",
    badgeReward: "Bug Slayer"
  },
  {
    slug: "git-recovery",
    name: "Git Recovery Path",
    description: "Train real Git survival: conflict resolution, bisect, rebase cleanup, stashes, worktrees, and release tags.",
    targetAudience: "Developers working in teams who need confidence when history gets messy.",
    estimatedHours: 14,
    categories: ["git", "cli-productivity"],
    challengeSlugs: [
      "git-easy-conflict-resolution",
      "git-easy-stash-worktree",
      "git-medium-bisect-regression",
      "git-medium-interactive-rebase",
      "git-hard-release-tag",
      "cli-productivity-hard-ripgrep-refactor",
      "git-extreme-stash-worktree",
      "git-insane-bisect-regression"
    ],
    milestones: [
      { title: "History first aid", description: "Recover local work and preserve intent.", requiredClears: 2 },
      { title: "Regression tracker", description: "Use history as a debugging tool.", requiredClears: 5 },
      { title: "Release guardian", description: "Keep shipping history auditable.", requiredClears: 8 }
    ],
    finalBossSlug: "git-disaster-recovery-boss",
    badgeReward: "Git Survivor"
  },
  {
    slug: "regex-mastery",
    name: "Regex Mastery Path",
    description: "Master practical patterns for logs, redaction, semantic versions, token scanning, Unicode slugs, and safe validation.",
    targetAudience: "Developers who touch logs, validation, search, security scanning, or data cleanup.",
    estimatedHours: 16,
    categories: ["regex", "security"],
    challengeSlugs: [
      "regex-easy-semantic-version",
      "regex-easy-log-parser",
      "regex-medium-semantic-version",
      "regex-medium-lookaround-token",
      "regex-hard-email-redaction",
      "regex-hard-unicode-slug",
      "regex-extreme-lookaround-token",
      "regex-insane-semantic-version"
    ],
    milestones: [
      { title: "Pattern scout", description: "Use anchors, groups, and boundaries deliberately.", requiredClears: 2 },
      { title: "Safe matcher", description: "Avoid overmatching and explain rejected strings.", requiredClears: 5 },
      { title: "Regex operator", description: "Handle Unicode, security context, and validation edge cases.", requiredClears: 8 }
    ],
    finalBossSlug: "api-debugging-boss",
    badgeReward: "Regex Warden"
  },
  {
    slug: "backend-api",
    name: "Backend API Path",
    description: "Build robust API instincts: pagination, idempotency, rate limits, webhooks, OpenAPI evolution, and security checks.",
    targetAudience: "Backend and full-stack engineers preparing for production API ownership.",
    estimatedHours: 24,
    categories: ["apis", "security", "system-design"],
    challengeSlugs: [
      "apis-easy-pagination-contract",
      "apis-easy-idempotency-key",
      "security-medium-webhook-replay-window",
      "apis-medium-rate-limit-envelope",
      "apis-hard-webhook-signature",
      "security-hard-rbac-admin-leak",
      "apis-extreme-openapi-evolution",
      "system-design-insane-rate-limiter"
    ],
    milestones: [
      { title: "Contract keeper", description: "Design stable request and response behavior.", requiredClears: 2 },
      { title: "Abuse defender", description: "Handle retries, signatures, limits, and spoofing.", requiredClears: 5 },
      { title: "Platform thinker", description: "Tie API contracts to scale and operations.", requiredClears: 8 }
    ],
    finalBossSlug: "api-debugging-boss",
    badgeReward: "Backend Sentinel"
  },
  {
    slug: "devops-command-line",
    name: "DevOps Command Line Path",
    description: "Practice the command-line side of DevOps: readiness gates, CI safety, Kubernetes triage, rollback, observability, and release hygiene.",
    targetAudience: "Developers moving toward DevOps, SRE, platform engineering, or production ownership.",
    estimatedHours: 24,
    categories: ["devops", "linux", "bash", "cli-productivity"],
    challengeSlugs: [
      "cli-productivity-easy-ripgrep-refactor",
      "bash-easy-strict-mode-script",
      "devops-easy-compose-postgres-readiness",
      "devops-medium-kubernetes-crashloop",
      "linux-medium-journal-triage",
      "devops-hard-ci-cache-safety",
      "devops-extreme-blue-green-cutover",
      "devops-insane-observability-slo-alert"
    ],
    milestones: [
      { title: "Local reliability", description: "Make development and scripts fail clearly.", requiredClears: 2 },
      { title: "Deployment operator", description: "Triage CI, Kubernetes, and rollout failures.", requiredClears: 5 },
      { title: "Production owner", description: "Connect rollback, observability, and SLO judgment.", requiredClears: 8 }
    ],
    finalBossSlug: "linux-log-forensics-boss",
    badgeReward: "DevOps Operator"
  },
  {
    slug: "system-design-foundations",
    name: "System Design Foundations Path",
    description: "A practical tour through cache invalidation, queues, sharding, rate limiting, SLOs, and observability.",
    targetAudience: "Engineers preparing for system-design interviews or first platform ownership.",
    estimatedHours: 25,
    categories: ["system-design", "devops", "apis"],
    challengeSlugs: [
      "system-design-easy-cache-invalidation",
      "system-design-easy-queue-backpressure",
      "system-design-medium-rate-limiter",
      "devops-medium-observability-slo-alert",
      "system-design-hard-sharding-strategy",
      "system-design-hard-slo-observability",
      "apis-extreme-rate-limit-envelope",
      "system-design-insane-sharding-strategy"
    ],
    milestones: [
      { title: "Tradeoff lens", description: "Recognize reliability, latency, and consistency costs.", requiredClears: 2 },
      { title: "Scale map", description: "Connect storage, queues, caches, and limits.", requiredClears: 5 },
      { title: "Review-ready", description: "Explain architecture under realistic constraints.", requiredClears: 8 }
    ],
    finalBossSlug: "api-debugging-boss",
    badgeReward: "System Slayer"
  },
  {
    slug: "insane-algorithm-arena",
    name: "Insane Algorithm Arena",
    description: "A late-game ladder for high-volume edge cases, adversarial inputs, and proof-quality algorithm explanations.",
    targetAudience: "Competitive programmers and senior interview candidates who want the hard rooms unlocked.",
    estimatedHours: 40,
    categories: ["algorithms", "data-structures", "cpp"],
    challengeSlugs: [
      "algorithms-hard-dijkstra-latency",
      "data-structures-hard-graph-union-find",
      "cpp-hard-heap-merge",
      "algorithms-extreme-dp-budget",
      "data-structures-extreme-trie-router",
      "cpp-extreme-unordered-map-cache",
      "algorithms-insane-toposort-deploy",
      "data-structures-insane-lru-cache"
    ],
    milestones: [
      { title: "Hard-mode ready", description: "Pass non-trivial graph and heap scenarios.", requiredClears: 2 },
      { title: "Adversarial thinker", description: "Handle scale, ties, and pathological input.", requiredClears: 5 },
      { title: "Gauntlet entrant", description: "Beat late-game hidden checks with explanation.", requiredClears: 8 }
    ],
    finalBossSlug: "insane-algorithm-gauntlet-boss",
    badgeReward: "Insane Architect"
  },
  {
    slug: "gencode-legend",
    name: "Gencode Legend Path",
    description: "A cross-discipline mastery route through shell, SQL, DSA, API, security, debugging, and DevOps.",
    targetAudience: "Ambitious learners who want broad technical fluency and a shareable mastery profile.",
    estimatedHours: 55,
    categories: ["linux", "sql", "algorithms", "apis", "security", "devops"],
    challengeSlugs: [
      "linux-medium-journal-triage",
      "sql-medium-retention-cohorts",
      "algorithms-hard-dijkstra-latency",
      "security-hard-ssrf-url-filter",
      "apis-hard-webhook-signature",
      "debugging-extreme-timeout-trace",
      "devops-extreme-blue-green-cutover",
      "system-design-insane-slo-observability"
    ],
    milestones: [
      { title: "Multi-skill operator", description: "Clear meaningful work in four distinct domains.", requiredClears: 3 },
      { title: "Incident tactician", description: "Connect code, data, systems, and safety.", requiredClears: 6 },
      { title: "Legend gate", description: "Enter the final gauntlet with broad mastery.", requiredClears: 8 }
    ],
    finalBossSlug: "insane-algorithm-gauntlet-boss",
    badgeReward: "Gencode Legend"
  }
];

export function getLearningPath(slug: string) {
  return learningPaths.find((path) => path.slug === slug) ?? null;
}

export function getLearningPathChallenges(path: LearningPathDefinition) {
  const bySlug = new Map(challengeCatalog.map((challenge) => [challenge.slug, challenge]));
  return path.challengeSlugs
    .map((slug) => bySlug.get(slug))
    .filter((challenge): challenge is NonNullable<typeof challenge> => Boolean(challenge));
}

export type CalibrationInput = {
  experienceLevel: string;
  targetGoal: string;
  preferredCategories: string[];
  weakestTopics: string[];
  preferredLanguage: string;
  minutesPerDay: number;
  preparingFor: string;
};

export function recommendLearningPath(input: CalibrationInput) {
  const text = [
    input.targetGoal,
    input.preparingFor,
    input.preferredLanguage,
    ...input.preferredCategories,
    ...input.weakestTopics
  ]
    .join(" ")
    .toLowerCase();

  if (/\bsql.*(optimi[sz]e|performance|index|query plan)|index|query plan/.test(text)) return "sql-optimization";
  if (/\bsql|data analyst|analytics|warehouse/.test(text)) return "sql-analyst";
  if (/\bdevops|sre|kubernetes|ci|deploy|command line/.test(text)) return "devops-command-line";
  if (/\bforensics|incident|logs|ssh|journal/.test(text)) return "linux-forensics";
  if (/\blinux|shell|terminal|command/.test(text)) return "linux-survival";
  if (/\bgraph|bfs|dfs|dijkstra|toposort/.test(text)) return "graph-algorithms";
  if (/\bdsa|algorithm|interview|leetcode|competitive/.test(text)) return "dsa-interview";
  if (/\bregex|regular expression|pattern/.test(text)) return "regex-mastery";
  if (/\bpython|data engineering|automation/.test(text)) return "python-problem-solver";
  if (/\bjavascript|typescript|frontend|react|debug/.test(text)) return "javascript-debugger";
  if (/\bgit|rebase|merge|branch/.test(text)) return "git-recovery";
  if (/\bapi|backend|webhook|rate limit/.test(text)) return "backend-api";
  if (/\bsystem design|architecture|scale|distributed/.test(text)) return "system-design-foundations";
  if (input.experienceLevel === "advanced" || input.minutesPerDay >= 90) return "gencode-legend";
  return "backend-api";
}
