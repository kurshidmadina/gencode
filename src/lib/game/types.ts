export const categories = [
  {
    slug: "linux",
    name: "Linux",
    icon: "Terminal",
    color: "#60f3ff",
    description: "Filesystem, processes, permissions, networking, services, and production shell fluency."
  },
  {
    slug: "bash",
    name: "Bash",
    icon: "SquareTerminal",
    color: "#8bff9f",
    description: "Shell scripting, pipes, text processing, automation, traps, and portable command patterns."
  },
  {
    slug: "sql",
    name: "SQL",
    icon: "Database",
    color: "#ffd166",
    description: "Queries, joins, aggregation, indexing, windows, transactions, and data investigation."
  },
  {
    slug: "data-structures",
    name: "Data Structures",
    icon: "Network",
    color: "#ff8fb7",
    description: "Arrays, linked lists, stacks, queues, trees, graphs, heaps, maps, and amortized thinking."
  },
  {
    slug: "algorithms",
    name: "Algorithms",
    icon: "BrainCircuit",
    color: "#a7f3d0",
    description: "Search, sort, recursion, dynamic programming, greedy methods, graph traversal, and complexity."
  },
  {
    slug: "python",
    name: "Python",
    icon: "Code2",
    color: "#93c5fd",
    description: "Idiomatic Python, standard library fluency, debugging, data handling, and testing."
  },
  {
    slug: "javascript",
    name: "JavaScript",
    icon: "Braces",
    color: "#facc15",
    description: "Modern JavaScript, async flows, browser APIs, modules, data transforms, and runtime behavior."
  },
  {
    slug: "typescript",
    name: "TypeScript",
    icon: "FileCode2",
    color: "#60a5fa",
    description: "Type narrowing, generics, discriminated unions, API contracts, safer refactors, and library-grade types."
  },
  {
    slug: "java",
    name: "Java",
    icon: "Coffee",
    color: "#fb7185",
    description: "Core Java, collections, OOP, concurrency basics, streams, and interview-ready implementation."
  },
  {
    slug: "cpp",
    name: "C++",
    icon: "Cpu",
    color: "#67e8f9",
    description: "STL, memory, templates, algorithms, performance, and low-level debugging discipline."
  },
  {
    slug: "git",
    name: "Git",
    icon: "GitBranch",
    color: "#f97316",
    description: "Branching, rebasing, conflict resolution, bisecting, release hygiene, and team workflows."
  },
  {
    slug: "apis",
    name: "APIs",
    icon: "Webhook",
    color: "#c084fc",
    description: "HTTP, REST, pagination, auth, error handling, contracts, and observability-friendly clients."
  },
  {
    slug: "system-design",
    name: "System Design",
    icon: "Boxes",
    color: "#38bdf8",
    description: "Scalability fundamentals, queues, caches, storage tradeoffs, reliability, and diagrams."
  },
  {
    slug: "debugging",
    name: "Debugging",
    icon: "Bug",
    color: "#f43f5e",
    description: "Reading failures, reducing scope, log strategy, stack traces, broken code, and production triage."
  },
  {
    slug: "regex",
    name: "Regex",
    icon: "Regex",
    color: "#34d399",
    description: "Pattern matching, grouping, anchors, lookarounds, replacements, and safe validation."
  },
  {
    slug: "cli-productivity",
    name: "CLI Productivity",
    icon: "Keyboard",
    color: "#e879f9",
    description: "Fast navigation, fuzzy search, command history, tmux-like flows, and terminal ergonomics."
  },
  {
    slug: "security",
    name: "Security Basics",
    icon: "ShieldCheck",
    color: "#f472b6",
    description: "Secure coding, auth flaws, injection risks, secrets, webhooks, threat modeling, and safe debugging."
  },
  {
    slug: "devops",
    name: "DevOps Basics",
    icon: "ServerCog",
    color: "#22d3ee",
    description: "Containers, CI/CD, deployment safety, observability, infrastructure hygiene, and incident readiness."
  }
] as const;

export const difficulties = ["EASY", "MEDIUM", "HARD", "EXTREME", "INSANE"] as const;
export const challengeTypes = [
  "CODING",
  "SQL",
  "LINUX",
  "BASH_SCRIPTING",
  "MULTIPLE_CHOICE",
  "DEBUGGING",
  "DATA_STRUCTURE_VISUALIZATION",
  "ALGORITHM_TRACING",
  "GIT_WORKFLOW",
  "API_CHALLENGE",
  "FILL_IN_CODE",
  "OUTPUT_PREDICTION",
  "SECURITY_DEBUGGING",
  "SYSTEM_DESIGN_MINI",
  "BOSS_STAGE"
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
export type Difficulty = (typeof difficulties)[number];
export type ChallengeType = (typeof challengeTypes)[number];
export type ChallengeStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "ARCHIVED";
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type ChallengeTestCase = {
  name: string;
  input?: unknown;
  expected?: unknown;
  command?: string;
  query?: string;
  answer?: unknown;
};

export type ChallengeValidationMetadata = {
  kind: ChallengeType;
  complexityTarget?: string;
  forbiddenPatterns?: string[];
  code?: {
    functionName?: string;
    inputFormat?: string;
    outputFormat?: string;
    expectedComplexity?: string;
    edgeCases: string[];
  };
  sql?: {
    dialect: "postgresql" | "sqlite" | "mysql" | "generic";
    schema: string;
    seedRows: Array<Record<string, unknown>>;
    expectedResult: unknown;
    forbiddenStatements: string[];
    validationQuery?: string;
  };
  linux?: {
    simulatedFilesystem: Array<{ path: string; type: "file" | "directory"; content?: string; mode?: string; owner?: string }>;
    allowedCommands: string[];
    forbiddenOperations: string[];
    expectedOutput?: string;
    finalState?: string;
  };
  git?: {
    initialRepoState: string;
    requiredFinalState: string;
    commandValidation: string[];
    forbiddenOperations: string[];
  };
  multipleChoice?: {
    options: Array<{ id: "A" | "B" | "C" | "D"; text: string; explanation: string }>;
    correctAnswer: "A" | "B" | "C" | "D";
  };
  debugging?: {
    brokenCode: string;
    expectedFixedBehavior: string;
    rootCause: string;
    regressionTests: string[];
  };
  api?: {
    endpoint: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    requestShape: Record<string, unknown>;
    expectedResponse: Record<string, unknown>;
    failureModes: string[];
  };
  systemDesign?: {
    constraints: string[];
    evaluationRubric: string[];
    tradeoffs: string[];
  };
};

export type GeneratedChallenge = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  story: string;
  learningObjective: string;
  instructions: string;
  categorySlug: CategorySlug;
  difficulty: Difficulty;
  type: ChallengeType;
  status: ChallengeStatus;
  tags: string[];
  prerequisites: string[];
  xpReward: number;
  coinReward: number;
  starterCode?: string;
  language?: string;
  testCases: ChallengeTestCase[];
  hiddenTestCases: ChallengeTestCase[];
  validationMetadata: ChallengeValidationMetadata;
  examples: ChallengeTestCase[];
  hints: string[];
  solution?: string;
  explanation: string;
  successCriteria: string[];
  relatedChallenges: string[];
  estimatedTime: number;
  unlockRules: {
    requiredCompletions: Partial<Record<Difficulty, number>>;
  };
  featured?: boolean;
};

export type ChallengeFilters = {
  query?: string;
  category?: string;
  difficulty?: string;
  type?: string;
  status?: string;
  tag?: string;
  minXp?: string;
  maxXp?: string;
};
