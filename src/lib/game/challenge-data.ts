import { categories, type CategorySlug, type ChallengeType, type Difficulty, type GeneratedChallenge } from "./types";
import { difficultyXp, unlockRequirements } from "./progression";

type SubjectBlueprint = {
  key: string;
  title: string;
  concept: string;
  scenario: string;
  artifact: string;
  tags: string[];
  type?: ChallengeType;
  language?: string;
};

type CategoryBlueprint = {
  categorySlug: CategorySlug;
  defaultType: ChallengeType;
  language?: string;
  workplace: string;
  subjects: SubjectBlueprint[];
};

const difficultyMeta: Record<
  Difficulty,
  { label: string; verb: string; scope: string; instructionDepth: string; time: number; xpOffset: number }
> = {
  EASY: {
    label: "Easy",
    verb: "Warm up with",
    scope: "a focused single-step task",
    instructionDepth: "Implement the direct solution first, then document the one edge case that can break it.",
    time: 12,
    xpOffset: -10
  },
  MEDIUM: {
    label: "Medium",
    verb: "Stabilize",
    scope: "a realistic production-sized input",
    instructionDepth: "Handle normal data, malformed data, and deterministic ordering before optimizing.",
    time: 24,
    xpOffset: 0
  },
  HARD: {
    label: "Hard",
    verb: "Harden",
    scope: "a failure-prone workflow with multiple edge cases",
    instructionDepth: "Design for correctness under duplicates, missing values, and high-volume input.",
    time: 40,
    xpOffset: 20
  },
  EXTREME: {
    label: "Extreme",
    verb: "Rescue",
    scope: "an incident simulation with strict safety and performance constraints",
    instructionDepth: "Minimize blast radius, make the result auditable, and explain the tradeoff you chose.",
    time: 60,
    xpOffset: 40
  },
  INSANE: {
    label: "Insane",
    verb: "Master",
    scope: "a tournament-grade scenario that combines correctness, scale, and subtle hidden cases",
    instructionDepth: "Prove your approach, handle adversarial inputs, and leave the solution maintainable.",
    time: 85,
    xpOffset: 80
  }
};

const blueprints: CategoryBlueprint[] = [
  {
    categorySlug: "linux",
    defaultType: "LINUX",
    language: "bash",
    workplace: "a Linux production host",
    subjects: [
      {
        key: "permissions-audit",
        title: "permission drift audit",
        concept: "Unix permissions, ownership, and safe read-only inspection",
        scenario: "A deployment directory started denying reads to the application user after a rushed hotfix.",
        artifact: "./deploy contains nested files, directories with spaces, and mixed ownership metadata.",
        tags: ["permissions", "find", "ownership", "quoting"]
      },
      {
        key: "process-forensics",
        title: "runaway process forensics",
        concept: "process inspection with ps, pgrep, lsof, and deterministic filtering",
        scenario: "CPU alarms point to a worker family that respawns under similar command names.",
        artifact: "A process table snapshot contains parent IDs, command lines, CPU usage, and open ports.",
        tags: ["processes", "ps", "pgrep", "lsof"]
      },
      {
        key: "journal-triage",
        title: "journal failure triage",
        concept: "journalctl filtering, time windows, units, and severity levels",
        scenario: "A systemd service flapped overnight and the on-call needs a compact failure report.",
        artifact: "journald entries include multiple units, boot IDs, priorities, and repeated stack traces.",
        tags: ["journald", "systemd", "logs", "incident"]
      },
      {
        key: "disk-pressure",
        title: "disk pressure hunt",
        concept: "du, df, sort, and safe cleanup planning",
        scenario: "A node is minutes from filling its root volume, but deleting the wrong cache can break deploys.",
        artifact: "Filesystem samples include mount points, cache folders, sparse files, and log rotations.",
        tags: ["disk", "du", "df", "sort"]
      },
      {
        key: "network-sockets",
        title: "socket ownership map",
        concept: "ss, lsof, ports, listeners, and service ownership",
        scenario: "A container rollout left two services fighting for the same port family.",
        artifact: "Socket listings contain TCP listeners, established connections, PIDs, and service names.",
        tags: ["network", "ss", "ports", "lsof"]
      }
    ]
  },
  {
    categorySlug: "bash",
    defaultType: "BASH_SCRIPTING",
    language: "bash",
    workplace: "a shell automation repository",
    subjects: [
      {
        key: "strict-mode-script",
        title: "strict mode deploy script",
        concept: "set -euo pipefail, traps, and explicit error paths",
        scenario: "A deploy helper silently skipped a failed migration and reported success.",
        artifact: "deploy.sh receives environment names, migration commands, and optional dry-run flags.",
        tags: ["strict-mode", "trap", "errors", "deploy"]
      },
      {
        key: "awk-metrics",
        title: "awk latency report",
        concept: "awk grouping, numeric aggregation, and stable reports",
        scenario: "SREs need a one-command latency summary from raw access logs before a meeting.",
        artifact: "access.log rows include timestamp, route, status, latency_ms, and request_id.",
        tags: ["awk", "logs", "aggregation", "latency"]
      },
      {
        key: "argument-parser",
        title: "portable argument parser",
        concept: "getopts-style parsing, validation, and usage output",
        scenario: "A cleanup script is dangerous unless it rejects unknown flags and requires confirmation.",
        artifact: "cleanup.sh accepts --env, --older-than, --dry-run, and --confirm flags.",
        tags: ["arguments", "getopts", "validation", "usage"]
      },
      {
        key: "parallel-jobs",
        title: "bounded parallel jobs",
        concept: "concurrency limits, wait, exit code collection, and retries",
        scenario: "A backfill script overwhelms a partner API when every job starts at once.",
        artifact: "A task list contains account IDs, retry budgets, and per-account output files.",
        tags: ["parallel", "wait", "retries", "backfill"]
      },
      {
        key: "sed-redaction",
        title: "sed secret redaction",
        concept: "safe text replacement, backups, and secret pattern handling",
        scenario: "Support logs must be shared with engineering after API tokens and emails are removed.",
        artifact: "support.log contains bearer tokens, emails, request IDs, and multiline stack traces.",
        tags: ["sed", "redaction", "secrets", "logs"]
      }
    ]
  },
  {
    categorySlug: "sql",
    defaultType: "SQL",
    language: "sql",
    workplace: "an analytics warehouse",
    subjects: [
      {
        key: "duplicate-transactions",
        title: "duplicate transaction detector",
        concept: "GROUP BY, HAVING, tie-safe ordering, and read-only analysis",
        scenario: "Payment retries created duplicate checkout events and finance needs a reproducible list.",
        artifact: "transactions(id, user_id, order_id, status, amount_cents, created_at).",
        tags: ["group-by", "having", "transactions", "order-by"]
      },
      {
        key: "retention-cohorts",
        title: "retention cohort matrix",
        concept: "date bucketing, joins, and cohort aggregation",
        scenario: "Product wants week-one and week-four retention without double counting returning users.",
        artifact: "users(id, created_at) and events(user_id, event_name, occurred_at).",
        tags: ["cohorts", "dates", "joins", "retention"]
      },
      {
        key: "window-ranking",
        title: "window ranking leaderboard",
        concept: "RANK, ROW_NUMBER, partitions, and deterministic tie breakers",
        scenario: "A weekly contest leaderboard is flapping when users have identical XP.",
        artifact: "submissions(user_id, category, xp, submitted_at, status).",
        tags: ["window-functions", "ranking", "leaderboard", "ties"]
      },
      {
        key: "recursive-cte",
        title: "recursive org chart",
        concept: "recursive CTEs, depth limits, and cycle safety",
        scenario: "HR imported a reporting tree and one accidental cycle is breaking the org browser.",
        artifact: "employees(id, manager_id, name, active).",
        tags: ["recursive-cte", "trees", "cycles", "hierarchy"]
      },
      {
        key: "query-plan-index",
        title: "query plan index choice",
        concept: "index selectivity, WHERE clauses, and explain-plan reasoning",
        scenario: "A dashboard query regressed after data growth and the team needs a safer index proposal.",
        artifact: "page_views(user_id, path, device, occurred_at) with 600M rows.",
        tags: ["indexes", "query-plan", "performance", "selectivity"]
      }
    ]
  },
  {
    categorySlug: "data-structures",
    defaultType: "CODING",
    language: "python",
    workplace: "an interview-style data structure lab",
    subjects: [
      {
        key: "lru-cache",
        title: "LRU cache core",
        concept: "hash map plus doubly linked list invariants",
        scenario: "A feature flag service needs O(1) reads and evictions under heavy traffic.",
        artifact: "Operations are GET key and PUT key value with a fixed capacity.",
        tags: ["lru", "hash-map", "linked-list", "cache"]
      },
      {
        key: "min-stack",
        title: "constant-time min stack",
        concept: "stack augmentation and invariant tracking",
        scenario: "A metrics engine needs the current minimum after every push and pop.",
        artifact: "Operations include push, pop, top, and get_min over signed integers.",
        tags: ["stack", "min", "invariants", "amortized"]
      },
      {
        key: "trie-router",
        title: "trie route matcher",
        concept: "prefix trees, terminal markers, and wildcard handling",
        scenario: "An API gateway needs fast matching for static and parameterized paths.",
        artifact: "Routes include /users/:id, /users/me, and /teams/:teamId/members.",
        tags: ["trie", "prefix", "routes", "wildcards"]
      },
      {
        key: "graph-union-find",
        title: "union-find connectivity",
        concept: "path compression, union by rank, and component counts",
        scenario: "A network simulator tracks whether hosts are connected after cable repairs.",
        artifact: "Commands connect two nodes and query if two nodes are in the same component.",
        tags: ["union-find", "graphs", "components", "path-compression"]
      },
      {
        key: "heap-scheduler",
        title: "heap task scheduler",
        concept: "priority queues, tie breakers, and stable scheduling",
        scenario: "A job runner must always execute the highest priority ready task without starving older tasks.",
        artifact: "Tasks have priority, created_at, id, and optional cooldown windows.",
        tags: ["heap", "priority-queue", "scheduler", "tie-breakers"]
      }
    ]
  },
  {
    categorySlug: "algorithms",
    defaultType: "CODING",
    language: "python",
    workplace: "an algorithm arena",
    subjects: [
      {
        key: "first-bad-build",
        title: "first bad build search",
        concept: "binary search over a monotonic predicate",
        scenario: "A deploy train contains the first build where tests begin failing.",
        artifact: "Input gives build count and a monotonic array where 0 means good and 1 means bad.",
        tags: ["binary-search", "monotonic", "first-true", "off-by-one"]
      },
      {
        key: "sliding-window-anomaly",
        title: "sliding window anomaly score",
        concept: "two pointers, running sums, and window constraints",
        scenario: "Fraud detection needs the shortest window whose score crosses a threshold.",
        artifact: "An array of event scores and a target risk threshold.",
        tags: ["sliding-window", "two-pointers", "arrays", "threshold"]
      },
      {
        key: "dijkstra-latency",
        title: "Dijkstra latency route",
        concept: "weighted graphs, priority queues, and stale heap entries",
        scenario: "An edge network chooses the lowest-latency route between regions.",
        artifact: "Edges are directed with positive latency weights and possible duplicate links.",
        tags: ["dijkstra", "graphs", "heap", "shortest-path"]
      },
      {
        key: "dp-budget",
        title: "dynamic programming budget planner",
        concept: "0/1 knapsack, state compression, and reconstruction",
        scenario: "A team must choose training modules under a fixed weekly time budget.",
        artifact: "Modules have time cost, XP value, and category labels.",
        tags: ["dynamic-programming", "knapsack", "optimization", "state"]
      },
      {
        key: "toposort-deploy",
        title: "topological deploy order",
        concept: "DAG ordering, cycle detection, and dependency resolution",
        scenario: "Services must deploy only after dependencies are healthy.",
        artifact: "Dependency pairs are service_before -> service_after.",
        tags: ["topological-sort", "dag", "cycles", "dependencies"]
      }
    ]
  },
  {
    categorySlug: "python",
    defaultType: "CODING",
    language: "python",
    workplace: "a Python service repository",
    subjects: [
      {
        key: "dataclass-parser",
        title: "dataclass event parser",
        concept: "dataclasses, validation, and structured parsing",
        scenario: "A webhook consumer needs to turn raw dictionaries into validated event objects.",
        artifact: "Events include id, type, created_at, actor, and optional payload fields.",
        tags: ["dataclasses", "parsing", "validation", "webhooks"]
      },
      {
        key: "iterator-batches",
        title: "iterator batching utility",
        concept: "iterators, generators, laziness, and memory-safe batching",
        scenario: "A data export must stream millions of IDs without loading them all at once.",
        artifact: "An arbitrary iterable and a positive batch size.",
        tags: ["iterators", "generators", "batching", "memory"]
      },
      {
        key: "asyncio-rate-limit",
        title: "asyncio rate-limited fetcher",
        concept: "async concurrency, semaphores, timeouts, and result ordering",
        scenario: "A client must call a partner API without exceeding concurrency limits.",
        artifact: "URLs, max concurrency, retry budget, and per-request timeout values.",
        tags: ["asyncio", "semaphore", "timeouts", "http"]
      },
      {
        key: "typing-protocol",
        title: "protocol-based plugin typing",
        concept: "typing.Protocol, generics, and interface contracts",
        scenario: "A CLI supports plugins and needs typed contracts without inheritance coupling.",
        artifact: "Plugins implement load, validate, and run methods with typed config.",
        tags: ["typing", "protocol", "generics", "plugins"]
      },
      {
        key: "pytest-debug",
        title: "pytest flaky fixture repair",
        concept: "fixtures, parametrization, monkeypatching, and deterministic tests",
        scenario: "A test suite sometimes passes locally and fails in CI because state leaks between tests.",
        artifact: "Tests share temp files, environment variables, and cached module globals.",
        tags: ["pytest", "fixtures", "debugging", "ci"]
      }
    ]
  },
  {
    categorySlug: "javascript",
    defaultType: "CODING",
    language: "javascript",
    workplace: "a modern JavaScript application",
    subjects: [
      {
        key: "promise-pool",
        title: "promise pool executor",
        concept: "Promises, concurrency limits, ordering, and rejection handling",
        scenario: "A browser client uploads files but must not saturate the network.",
        artifact: "An array of async task functions and a max concurrency value.",
        tags: ["promises", "concurrency", "async", "ordering"]
      },
      {
        key: "event-loop-trace",
        title: "event loop trace",
        concept: "microtasks, macrotasks, async/await, and render timing",
        scenario: "A UI animation janks because expensive work lands in the wrong task queue.",
        artifact: "A code snippet mixes setTimeout, queueMicrotask, promises, and synchronous logs.",
        tags: ["event-loop", "microtasks", "async", "browser"]
      },
      {
        key: "array-transform",
        title: "nested array transform",
        concept: "map, filter, reduce, grouping, and immutable updates",
        scenario: "Analytics events need to be grouped into a compact dashboard model.",
        artifact: "Events contain user, category, value, and timestamp fields.",
        tags: ["arrays", "reduce", "grouping", "immutability"]
      },
      {
        key: "fetch-retry",
        title: "fetch retry client",
        concept: "fetch, AbortController, retries, backoff, and error envelopes",
        scenario: "A frontend calls a flaky endpoint and needs predictable user-facing errors.",
        artifact: "Requests can fail with 429, 500, timeout, or malformed JSON.",
        tags: ["fetch", "retry", "abortcontroller", "errors"]
      },
      {
        key: "dom-storage",
        title: "safe localStorage cache",
        concept: "browser storage, JSON parsing, TTLs, and schema checks",
        scenario: "A dashboard caches preferences but must survive corrupted localStorage values.",
        artifact: "Stored entries include version, expires_at, and serialized preferences.",
        tags: ["localstorage", "json", "ttl", "schema"]
      }
    ]
  },
  {
    categorySlug: "typescript",
    defaultType: "CODING",
    language: "typescript",
    workplace: "a TypeScript monorepo",
    subjects: [
      {
        key: "discriminated-union",
        title: "discriminated union reducer",
        concept: "tagged unions, exhaustive checks, and reducer safety",
        scenario: "A billing reducer accepts several action shapes and silently ignores new actions.",
        artifact: "Actions include invoice.created, invoice.paid, invoice.failed, and invoice.refunded.",
        tags: ["discriminated-unions", "reducers", "exhaustive", "never"]
      },
      {
        key: "generic-result",
        title: "generic Result type",
        concept: "generics, error modeling, and safe unwrap helpers",
        scenario: "An API client currently throws inconsistently and needs typed success/error results.",
        artifact: "Functions return either data or structured error details with a status code.",
        tags: ["generics", "result", "errors", "api-client"]
      },
      {
        key: "type-narrowing",
        title: "unknown payload narrowing",
        concept: "unknown, type guards, narrowing, and runtime validation boundaries",
        scenario: "Webhook payloads arrive as unknown JSON and must be narrowed before use.",
        artifact: "Payload variants include user.created, user.deleted, and billing.updated.",
        tags: ["type-guards", "unknown", "narrowing", "webhooks"]
      },
      {
        key: "mapped-types",
        title: "mapped type form state",
        concept: "mapped types, keyof, partial updates, and readonly data",
        scenario: "A settings form needs typed dirty-state tracking for every field.",
        artifact: "A Settings interface includes profile, notification, and privacy fields.",
        tags: ["mapped-types", "keyof", "forms", "readonly"]
      },
      {
        key: "api-contract",
        title: "API contract client",
        concept: "typed endpoints, template literal types, and response inference",
        scenario: "A frontend SDK must infer response types from endpoint definitions.",
        artifact: "Endpoint definitions include method, path params, query, body, and response shapes.",
        tags: ["api-contracts", "template-literal-types", "inference", "sdk"]
      }
    ]
  },
  {
    categorySlug: "java",
    defaultType: "CODING",
    language: "java",
    workplace: "a Java backend interview lab",
    subjects: [
      {
        key: "collections-frequency",
        title: "collections frequency index",
        concept: "HashMap, sorting, and stable tie breakers",
        scenario: "A search service needs the top terms from query logs.",
        artifact: "Input contains one query term per line with mixed casing.",
        tags: ["collections", "hashmap", "sorting", "strings"]
      },
      {
        key: "stream-pipeline",
        title: "stream pipeline cleanup",
        concept: "Streams, collectors, grouping, and null-safe filtering",
        scenario: "A reporting endpoint uses loops that are hard to audit and easy to break.",
        artifact: "Records contain team, status, score, and optional owner fields.",
        tags: ["streams", "collectors", "grouping", "null-safety"]
      },
      {
        key: "priority-queue",
        title: "priority queue scheduler",
        concept: "PriorityQueue comparators and stable ordering",
        scenario: "A batch worker must pick the urgent task, then the oldest task, then the lowest ID.",
        artifact: "Tasks include priority, createdAt epoch, id, and payload.",
        tags: ["priorityqueue", "comparators", "scheduler", "ordering"]
      },
      {
        key: "concurrent-counter",
        title: "concurrent counter repair",
        concept: "AtomicInteger, synchronization, and race-condition reasoning",
        scenario: "Metrics counters are missing increments during high-concurrency tests.",
        artifact: "Multiple threads call increment, add, snapshot, and reset.",
        tags: ["concurrency", "atomic", "threads", "race-condition"]
      },
      {
        key: "record-validation",
        title: "record validation boundary",
        concept: "records, constructors, immutability, and validation",
        scenario: "A payment command object must reject invalid amounts before reaching business logic.",
        artifact: "PaymentCommand has userId, amountCents, currency, idempotencyKey.",
        tags: ["records", "validation", "immutability", "payments"]
      }
    ]
  },
  {
    categorySlug: "cpp",
    defaultType: "CODING",
    language: "cpp",
    workplace: "a C++ performance arena",
    subjects: [
      {
        key: "vector-two-pointer",
        title: "vector two-pointer scan",
        concept: "vectors, indices, sorted data, and overflow-safe sums",
        scenario: "A telemetry service needs to count pairs under a latency budget.",
        artifact: "A sorted vector of latency values and a maximum allowed pair sum.",
        tags: ["vectors", "two-pointers", "overflow", "pairs"]
      },
      {
        key: "unordered-map-cache",
        title: "unordered_map cache index",
        concept: "hash maps, reserve, custom keys, and collision-aware reasoning",
        scenario: "A request deduper needs fast lookups by composite request identity.",
        artifact: "Keys contain tenant, route, idempotency token, and timestamp bucket.",
        tags: ["unordered-map", "hashing", "cache", "composite-key"]
      },
      {
        key: "raii-file-guard",
        title: "RAII file guard",
        concept: "RAII, resource ownership, move semantics, and exception safety",
        scenario: "A parser leaks file handles when validation throws halfway through loading.",
        artifact: "A FileGuard wrapper owns a handle and must close exactly once.",
        tags: ["raii", "move-semantics", "files", "exception-safety"]
      },
      {
        key: "heap-merge",
        title: "heap merge streams",
        concept: "priority_queue, custom comparators, and k-way merge",
        scenario: "Log shards arrive sorted by timestamp and must be merged without loading everything.",
        artifact: "K sorted streams expose current timestamp, shard id, and message.",
        tags: ["priority-queue", "k-way-merge", "streams", "comparators"]
      },
      {
        key: "bitset-flags",
        title: "bitset feature flags",
        concept: "bitsets, masks, enum flags, and compact permissions",
        scenario: "A game server stores thousands of permission flags per player.",
        artifact: "Flags include read, write, trade, admin, beta, muted, and region locks.",
        tags: ["bitset", "masks", "flags", "permissions"]
      }
    ]
  },
  {
    categorySlug: "git",
    defaultType: "GIT_WORKFLOW",
    language: "bash",
    workplace: "a collaborative Git repository",
    subjects: [
      {
        key: "conflict-resolution",
        title: "conflict resolution drill",
        concept: "merge conflicts, intent preservation, and verification",
        scenario: "Two feature branches changed the same validation function differently.",
        artifact: "Conflict markers appear in validator.ts and tests describe both intended behaviors.",
        tags: ["merge-conflict", "tests", "resolution", "workflow"]
      },
      {
        key: "bisect-regression",
        title: "bisect regression hunt",
        concept: "git bisect, reproducible tests, and commit isolation",
        scenario: "A CLI command started failing sometime in the last 80 commits.",
        artifact: "A test command exits 0 for good commits and 1 for bad commits.",
        tags: ["bisect", "regression", "testing", "history"]
      },
      {
        key: "interactive-rebase",
        title: "interactive rebase cleanup",
        concept: "squash, fixup, reword, and preserving reviewable history",
        scenario: "A pull request contains noisy debug commits mixed with two logical changes.",
        artifact: "A branch has commits for logs, API fix, typo, tests, and a refactor.",
        tags: ["rebase", "fixup", "history", "review"]
      },
      {
        key: "stash-worktree",
        title: "stash and worktree rescue",
        concept: "stash safety, worktrees, and context switching",
        scenario: "A production hotfix arrives while local experimental edits are half-finished.",
        artifact: "Untracked files, staged edits, and an unrelated branch all exist locally.",
        tags: ["stash", "worktree", "hotfix", "untracked"]
      },
      {
        key: "release-tag",
        title: "signed release tag audit",
        concept: "tags, changelogs, ancestry, and release verification",
        scenario: "Release automation needs proof that v2.4.0 points at the reviewed commit.",
        artifact: "Tags include lightweight and annotated entries across multiple release branches.",
        tags: ["tags", "release", "audit", "ancestry"]
      }
    ]
  },
  {
    categorySlug: "regex",
    defaultType: "CODING",
    language: "javascript",
    workplace: "a text-processing challenge room",
    subjects: [
      {
        key: "log-parser",
        title: "structured log parser",
        concept: "named capture groups, anchors, and optional fields",
        scenario: "A log shipper must extract timestamp, level, request ID, and message from mixed logs.",
        artifact: "Lines include INFO, WARN, ERROR, optional request_id, and trailing messages.",
        tags: ["regex", "named-groups", "logs", "anchors"]
      },
      {
        key: "email-redaction",
        title: "email redaction pattern",
        concept: "word boundaries, replacements, and avoiding overmatching",
        scenario: "Support exports must mask emails while preserving domain-level debugging information.",
        artifact: "Text contains emails, usernames, URLs, and invalid address-like strings.",
        tags: ["redaction", "email", "replacement", "privacy"]
      },
      {
        key: "semantic-version",
        title: "semantic version validator",
        concept: "groups, alternation, pre-release labels, and anchors",
        scenario: "A package publisher rejects invalid release tags before CI starts.",
        artifact: "Versions include 1.2.3, 1.2.3-beta.1, and invalid leading-zero variants.",
        tags: ["semver", "validation", "anchors", "groups"]
      },
      {
        key: "lookaround-token",
        title: "lookaround token scanner",
        concept: "lookarounds, boundaries, and context-sensitive matches",
        scenario: "A security scanner must find tokens only when they appear in assignment contexts.",
        artifact: "Code snippets include token=, apiKey:, comments, and harmless prose.",
        tags: ["lookaround", "tokens", "security", "scanner"]
      },
      {
        key: "unicode-slug",
        title: "unicode slug sanitizer",
        concept: "Unicode classes, normalization, and safe replacements",
        scenario: "A CMS accepts international titles but must produce stable URL slugs.",
        artifact: "Titles include accents, punctuation, emoji, whitespace, and mixed scripts.",
        tags: ["unicode", "slug", "normalization", "validation"]
      }
    ]
  },
  {
    categorySlug: "apis",
    defaultType: "API_CHALLENGE",
    language: "typescript",
    workplace: "an API platform team",
    subjects: [
      {
        key: "pagination-contract",
        title: "cursor pagination contract",
        concept: "cursor design, stable ordering, and backward compatibility",
        scenario: "A mobile client drops items when new records arrive during pagination.",
        artifact: "GET /events returns items, next_cursor, limit, and sort metadata.",
        tags: ["pagination", "cursor", "contracts", "ordering"]
      },
      {
        key: "idempotency-key",
        title: "idempotency key design",
        concept: "safe retries, request hashes, and conflict responses",
        scenario: "Checkout retries sometimes create duplicate charges after client timeouts.",
        artifact: "POST /charges accepts amount, currency, customer_id, and Idempotency-Key.",
        tags: ["idempotency", "payments", "retries", "http"]
      },
      {
        key: "webhook-signature",
        title: "webhook signature verifier",
        concept: "HMAC verification, replay windows, and raw body handling",
        scenario: "An integration endpoint must reject spoofed or replayed webhook deliveries.",
        artifact: "Headers include timestamp, signature, delivery id, and event type.",
        tags: ["webhooks", "hmac", "security", "replay"]
      },
      {
        key: "rate-limit-envelope",
        title: "rate limit error envelope",
        concept: "429 responses, Retry-After, quotas, and client backoff",
        scenario: "Partners hammer an endpoint because errors do not include actionable retry metadata.",
        artifact: "Responses include status, code, message, retry_after, and request_id.",
        tags: ["rate-limits", "429", "backoff", "errors"]
      },
      {
        key: "openapi-evolution",
        title: "OpenAPI evolution review",
        concept: "schema compatibility, required fields, and versioning",
        scenario: "A team wants to add required fields to a public API without breaking old clients.",
        artifact: "OpenAPI schemas include User, CreateUserRequest, and ErrorEnvelope.",
        tags: ["openapi", "versioning", "compatibility", "schemas"]
      }
    ]
  },
  {
    categorySlug: "system-design",
    defaultType: "MULTIPLE_CHOICE",
    language: "text",
    workplace: "a system design review board",
    subjects: [
      {
        key: "cache-invalidation",
        title: "cache invalidation plan",
        concept: "TTL choices, write-through versus cache-aside, and stale-read risk",
        scenario: "A profile service serves stale account data after users update privacy settings.",
        artifact: "Clients read profiles through an API gateway, Redis cache, and Postgres source of truth.",
        tags: ["caching", "ttl", "consistency", "redis"]
      },
      {
        key: "queue-backpressure",
        title: "queue backpressure design",
        concept: "message queues, retries, dead-letter queues, and flow control",
        scenario: "An email worker falls behind during campaigns and retry storms amplify the backlog.",
        artifact: "Events enter a queue, workers call a provider API, and failures are retried with delay.",
        tags: ["queues", "backpressure", "retries", "dlq"]
      },
      {
        key: "rate-limiter",
        title: "distributed rate limiter",
        concept: "token buckets, sliding windows, clock drift, and tenant isolation",
        scenario: "A public API needs tenant-level limits across several stateless edge nodes.",
        artifact: "Requests include tenant id, route, timestamp, and region metadata.",
        tags: ["rate-limits", "distributed-systems", "tokens", "edge"]
      },
      {
        key: "sharding-strategy",
        title: "database sharding strategy",
        concept: "partition keys, hot shards, rebalancing, and query patterns",
        scenario: "A multi-tenant analytics table outgrew one primary database and noisy tenants dominate writes.",
        artifact: "Tables contain tenant_id, account_id, event_time, and several dashboard query shapes.",
        tags: ["sharding", "databases", "partitioning", "hotspots"]
      },
      {
        key: "slo-observability",
        title: "SLO observability map",
        concept: "SLIs, SLOs, error budgets, tracing, and alert quality",
        scenario: "A checkout API pages the team constantly, but alerts do not identify user impact.",
        artifact: "Signals include latency histograms, error counts, traces, logs, and business conversion metrics.",
        tags: ["slo", "observability", "tracing", "alerts"]
      }
    ]
  },
  {
    categorySlug: "cli-productivity",
    defaultType: "LINUX",
    language: "bash",
    workplace: "a high-speed terminal dojo",
    subjects: [
      {
        key: "fzf-history",
        title: "fzf command history recall",
        concept: "interactive history search, previews, and safe command reuse",
        scenario: "You need to rerun a long diagnostic command without accidentally replaying a destructive variant.",
        artifact: "Shell history includes kubectl, git, psql, curl, and prior cleanup commands.",
        tags: ["fzf", "history", "shell", "safety"]
      },
      {
        key: "ripgrep-refactor",
        title: "ripgrep refactor scout",
        concept: "rg filters, globs, context lines, and machine-readable matches",
        scenario: "A codebase changed a feature flag name and you need every safe replacement candidate.",
        artifact: "The repository contains generated files, vendor folders, tests, and source modules.",
        tags: ["ripgrep", "search", "globs", "refactor"]
      },
      {
        key: "tmux-incident-layout",
        title: "tmux incident layout",
        concept: "session layout, pane naming, logs, tests, and command ergonomics",
        scenario: "During an outage you need dashboards, logs, and a scratch shell visible without losing context.",
        artifact: "Commands tail logs, run health checks, watch queue depth, and keep notes.",
        tags: ["tmux", "incident", "panes", "workflow"]
      },
      {
        key: "jq-api-triage",
        title: "jq API triage",
        concept: "JSON selection, grouping, sorting, and defensive null handling",
        scenario: "An API dump is too large to inspect manually and contains missing nested fields.",
        artifact: "responses.json has status, route, latency_ms, error.code, and request_id.",
        tags: ["jq", "json", "api", "triage"]
      },
      {
        key: "shell-navigation",
        title: "shell navigation speedrun",
        concept: "directory jumping, safe aliases, command substitution, and repeatable workflows",
        scenario: "A monorepo task requires moving between app, package, infra, and test folders repeatedly.",
        artifact: "The repository has nested apps, packages, generated output, and similarly named directories.",
        tags: ["navigation", "aliases", "monorepo", "productivity"]
      }
    ]
  },
  {
    categorySlug: "debugging",
    defaultType: "DEBUGGING",
    language: "typescript",
    workplace: "a debugging war room",
    subjects: [
      {
        key: "null-path",
        title: "null path crash",
        concept: "stack traces, nullability, and guard placement",
        scenario: "A profile page crashes only for users who have never uploaded an avatar.",
        artifact: "A stack trace points to avatar.url.split and test data omits avatar.",
        tags: ["null", "stack-trace", "guards", "ui"]
      },
      {
        key: "race-condition",
        title: "race condition repro",
        concept: "timing, shared state, and deterministic reproduction",
        scenario: "Two concurrent saves sometimes overwrite the newest settings with stale data.",
        artifact: "Logs show request IDs, read versions, write versions, and response order.",
        tags: ["race-condition", "concurrency", "repro", "state"]
      },
      {
        key: "memory-leak",
        title: "memory leak hunt",
        concept: "retained references, event listeners, and heap snapshots",
        scenario: "A dashboard tab grows by 20MB every route change during a monitoring session.",
        artifact: "Components attach listeners, intervals, and cached chart data.",
        tags: ["memory-leak", "listeners", "heap", "frontend"]
      },
      {
        key: "flaky-test",
        title: "flaky test isolation",
        concept: "test ordering, shared state, fake timers, and cleanup",
        scenario: "A unit test fails only when the entire suite runs in CI.",
        artifact: "Tests mutate Date.now, localStorage, and module-level caches.",
        tags: ["flaky-tests", "ci", "isolation", "timers"]
      },
      {
        key: "timeout-trace",
        title: "timeout trace investigation",
        concept: "distributed tracing, slow dependency isolation, and retries",
        scenario: "An API intermittently exceeds its 2s SLO but app logs only show a generic timeout.",
        artifact: "Trace spans include gateway, auth, database, cache, and partner API calls.",
        tags: ["timeouts", "tracing", "slo", "latency"]
      }
    ]
  },
  {
    categorySlug: "security",
    defaultType: "SECURITY_DEBUGGING",
    language: "typescript",
    workplace: "a secure engineering review room",
    subjects: [
      {
        key: "jwt-algorithm-confusion",
        title: "JWT algorithm confusion audit",
        concept: "token validation, allowed algorithms, key handling, and auth boundary tests",
        scenario: "A partner integration accepts JWTs from multiple issuers and a security review found suspicious `alg` headers.",
        artifact: "Verifier code parses headers, selects keys, checks issuer/audience, and returns user claims.",
        tags: ["jwt", "auth", "tokens", "validation"]
      },
      {
        key: "ssrf-url-filter",
        title: "SSRF URL filter repair",
        concept: "URL parsing, private network blocking, redirect handling, and allowlist policy",
        scenario: "An image proxy fetches user-provided URLs and internal metadata endpoints are showing probe attempts.",
        artifact: "Requests include hostnames, redirects, IPv6 literals, localhost aliases, and cloud metadata IPs.",
        tags: ["ssrf", "url", "network", "allowlist"]
      },
      {
        key: "xss-markdown-renderer",
        title: "XSS markdown renderer fix",
        concept: "HTML sanitization, safe links, script stripping, and regression payloads",
        scenario: "A profile bio renderer supports markdown, but a report shows JavaScript executing inside preview cards.",
        artifact: "Markdown includes links, images, inline HTML, code fences, and crafted event-handler attributes.",
        tags: ["xss", "sanitization", "markdown", "browser"]
      },
      {
        key: "rbac-admin-leak",
        title: "RBAC admin leak closure",
        concept: "server-side authorization, role checks, object ownership, and audit logging",
        scenario: "A normal user can discover admin-only analytics through a route that hides UI links but trusts the client.",
        artifact: "API handlers receive session claims, path params, and role metadata from Auth.js.",
        tags: ["rbac", "authorization", "admin", "audit"]
      },
      {
        key: "secret-redaction-logs",
        title: "secret redaction in logs",
        concept: "credential detection, structured logging, redaction boundaries, and safe observability",
        scenario: "Incident logs accidentally included API keys from failed webhook requests.",
        artifact: "Log entries include headers, bodies, stack traces, request IDs, and nested JSON payloads.",
        tags: ["secrets", "logging", "redaction", "observability"]
      },
      {
        key: "csrf-state-token",
        title: "CSRF state token review",
        concept: "same-site cookies, state tokens, origin checks, and replay resistance",
        scenario: "A settings update endpoint is protected by login but not by a trustworthy state-changing request guard.",
        artifact: "Requests contain cookies, origin headers, form payloads, and optional anti-CSRF tokens.",
        tags: ["csrf", "cookies", "origin", "forms"]
      },
      {
        key: "sql-injection-boundary",
        title: "SQL injection boundary test",
        concept: "parameterized queries, query builders, escaping myths, and test payloads",
        scenario: "A search endpoint interpolates user filters into SQL after a rushed dashboard migration.",
        artifact: "Filters include category, sort direction, text search, limit, and date ranges.",
        tags: ["sql-injection", "parameters", "database", "validation"]
      },
      {
        key: "webhook-replay-window",
        title: "webhook replay window defense",
        concept: "HMAC signatures, timestamp tolerance, idempotency, and delivery dedupe",
        scenario: "Attackers replay old webhook deliveries and the billing system accepts them as fresh events.",
        artifact: "Headers include timestamp, signature, delivery id, provider id, and raw body hash.",
        tags: ["webhooks", "hmac", "replay", "idempotency"]
      },
      {
        key: "rate-limit-abuse-path",
        title: "rate limit abuse path",
        concept: "identity keys, IP fallback, sliding windows, and bypass-resistant throttles",
        scenario: "A signup endpoint is being hammered through rotating headers that spoof client identity.",
        artifact: "Requests include IP, forwarded headers, user id when present, and route names.",
        tags: ["rate-limit", "abuse", "signup", "headers"]
      },
      {
        key: "dependency-cve-triage",
        title: "dependency CVE triage",
        concept: "vulnerability impact analysis, reachable code, semver upgrades, and mitigation notes",
        scenario: "A dependency scanner flags a critical package used by build tooling and leadership needs a real risk call.",
        artifact: "Advisory data includes CVSS, affected versions, exploitability notes, transitive paths, and lockfile entries.",
        tags: ["cve", "dependencies", "supply-chain", "triage"]
      }
    ]
  },
  {
    categorySlug: "devops",
    defaultType: "BASH_SCRIPTING",
    language: "bash",
    workplace: "a deployment operations lab",
    subjects: [
      {
        key: "docker-healthcheck",
        title: "Docker healthcheck hardening",
        concept: "container health probes, startup grace, exit codes, and observable failure modes",
        scenario: "A container restarts constantly because the healthcheck is too fragile during warmup.",
        artifact: "Dockerfile defines CMD, HEALTHCHECK, ports, environment variables, and a `/healthz` endpoint.",
        tags: ["docker", "healthcheck", "containers", "readiness"]
      },
      {
        key: "compose-postgres-readiness",
        title: "compose Postgres readiness gate",
        concept: "service dependencies, readiness checks, connection retries, and local developer reliability",
        scenario: "Developers see random signup failures because the app starts before Postgres accepts connections.",
        artifact: "docker-compose.yml includes app, postgres, migrations, volumes, and environment variables.",
        tags: ["docker-compose", "postgres", "readiness", "local-dev"]
      },
      {
        key: "ci-cache-safety",
        title: "CI cache safety review",
        concept: "cache keys, lockfile integrity, dependency restore, and poisoned cache avoidance",
        scenario: "A CI job became faster, but test results now depend on stale cached dependencies.",
        artifact: "GitHub Actions steps restore npm cache, install dependencies, run Prisma generate, and execute tests.",
        tags: ["ci", "cache", "github-actions", "lockfile"]
      },
      {
        key: "blue-green-cutover",
        title: "blue-green deployment cutover",
        concept: "traffic switching, health verification, rollback triggers, and migration safety",
        scenario: "A release needs zero downtime while a schema-compatible migration rolls out.",
        artifact: "Environments include blue, green, load balancer checks, migration status, and smoke tests.",
        tags: ["deployment", "blue-green", "rollback", "migrations"]
      },
      {
        key: "terraform-drift-report",
        title: "Terraform drift report",
        concept: "state inspection, plan review, sensitive output handling, and change approval",
        scenario: "Production infrastructure has drifted after manual console edits and the team needs a safe report.",
        artifact: "Terraform plan output includes resource creates, updates, deletes, and sensitive attributes.",
        tags: ["terraform", "drift", "infrastructure", "plan"]
      },
      {
        key: "kubernetes-crashloop",
        title: "Kubernetes CrashLoop triage",
        concept: "pods, logs, events, probes, resource limits, and rollout history",
        scenario: "A service rolls into CrashLoopBackOff only after the second replica starts.",
        artifact: "kubectl snapshots include pods, describe output, previous logs, deployment YAML, and events.",
        tags: ["kubernetes", "crashloop", "logs", "events"]
      },
      {
        key: "observability-slo-alert",
        title: "SLO alert tuning",
        concept: "burn-rate alerts, error budgets, latency histograms, and actionable pages",
        scenario: "The on-call team is paged for noise while real user-impacting latency slips through.",
        artifact: "Metrics include request counts, 5xx rates, latency buckets, traces, and business conversion events.",
        tags: ["slo", "alerts", "observability", "burn-rate"]
      },
      {
        key: "backup-restore-drill",
        title: "backup restore drill",
        concept: "restore verification, RPO/RTO, checksum validation, and rollback-safe exercises",
        scenario: "Compliance asks for proof that backups can actually restore customer data.",
        artifact: "Backup metadata includes snapshot time, checksum, database version, restore logs, and sample queries.",
        tags: ["backup", "restore", "database", "resilience"]
      },
      {
        key: "feature-flag-rollback",
        title: "feature flag rollback playbook",
        concept: "kill switches, scoped rollout, metrics gates, and fast rollback commands",
        scenario: "A new checkout feature increases errors for one region and must be disabled without redeploying.",
        artifact: "Flag config includes percentage rollout, segments, regions, owners, and audit events.",
        tags: ["feature-flags", "rollback", "release", "incident"]
      },
      {
        key: "log-retention-policy",
        title: "log retention policy check",
        concept: "retention windows, privacy constraints, storage cost, and compliance deletion",
        scenario: "Log volume exploded after debug mode stayed enabled and privacy wants shorter retention for sensitive fields.",
        artifact: "Log sinks include application logs, audit logs, traces, metrics, and cold archive buckets.",
        tags: ["logs", "retention", "privacy", "cost"]
      }
    ]
  }
];

function categoryName(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

function languageFor(categorySlug: CategorySlug, type: ChallengeType, preferred?: string) {
  if (preferred) return preferred;
  if (type === "SQL") return "sql";
  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") return "bash";
  if (categorySlug === "javascript" || categorySlug === "regex") return "javascript";
  if (categorySlug === "typescript" || categorySlug === "apis" || categorySlug === "debugging" || categorySlug === "security") return "typescript";
  if (categorySlug === "devops") return "bash";
  if (categorySlug === "java") return "java";
  if (categorySlug === "cpp") return "cpp";
  return "python";
}

function typeForSubject(category: CategoryBlueprint, subject: SubjectBlueprint, difficulty: Difficulty) {
  if (subject.type) return subject.type;
  if (category.categorySlug === "algorithms" && difficulty === "EASY") return "ALGORITHM_TRACING";
  if (category.categorySlug === "data-structures" && (difficulty === "EASY" || difficulty === "MEDIUM")) {
    return "DATA_STRUCTURE_VISUALIZATION";
  }
  if (category.categorySlug === "regex" && difficulty === "EASY") return "MULTIPLE_CHOICE";
  if (category.categorySlug === "system-design" && subject.key === "slo-observability" && difficulty === "INSANE") return "BOSS_STAGE";
  if (category.categorySlug === "system-design") return "SYSTEM_DESIGN_MINI";
  if (category.categorySlug === "security") return "SECURITY_DEBUGGING";
  if (category.categorySlug === "javascript" && difficulty === "EASY") return "OUTPUT_PREDICTION";
  if (category.categorySlug === "typescript" && difficulty === "MEDIUM") return "FILL_IN_CODE";
  return category.defaultType;
}

function starterCodeFor({
  type,
  language,
  subject,
  difficulty
}: {
  type: ChallengeType;
  language: string;
  subject: SubjectBlueprint;
  difficulty: Difficulty;
}) {
  if (type === "SQL") {
    return `-- ${subject.artifact}\n-- Goal: solve the ${subject.title} challenge.\nWITH source_rows AS (\n  SELECT *\n  FROM events\n)\nSELECT *\nFROM source_rows\nORDER BY 1;`;
  }

  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") {
    return `# Starting state: ${subject.artifact}\n# Goal: ${subject.title}\nset -euo pipefail\n\n# Write a safe, deterministic command sequence below.\n`;
  }

  if (type === "MULTIPLE_CHOICE" || type === "API_CHALLENGE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE") {
    return `Options:\nA. Optimize for the fastest happy path and document failures later.\nB. Preserve correctness, deterministic behavior, and explicit failure handling.\nC. Skip validation because upstream services should send clean data.\nD. Mutate production data first, then inspect the result.\n\nAnswer with the best option and a short justification.`;
  }

  if (type === "DEBUGGING" || type === "SECURITY_DEBUGGING") {
    return `// Broken scenario: ${subject.scenario}\n// Artifact: ${subject.artifact}\n// Task: identify the root cause, patch the code, and explain the regression test.\nexport function solve(input: string): string {\n  const rows = input.split(\"\\n\");\n  return rows[0].trim();\n}\n`;
  }

  if (type === "FILL_IN_CODE") {
    return `export function solve(input: string): unknown {\n  const rows = input.trim() ? input.trim().split(\"\\n\") : [];\n  // TODO: fill in the missing invariant for ${subject.concept}.\n  const result = rows\n    .map((row) => row.trim())\n    .filter(Boolean);\n  return /* fill this */ result.length;\n}\n`;
  }

  if (language === "typescript") {
    return `export function solve(input: string): unknown {\n  const lines = input.trim().length ? input.trim().split(\"\\n\") : [];\n  // ${difficulty}: implement ${subject.concept}.\n  return lines.length;\n}\n`;
  }

  if (language === "javascript") {
    return `export function solve(input) {\n  const lines = input.trim() ? input.trim().split(\"\\n\") : [];\n  // ${difficulty}: implement ${subject.concept}.\n  return lines.length;\n}\n`;
  }

  if (language === "java") {
    return `import java.util.*;\n\nclass Solution {\n  public Object solve(String input) {\n    List<String> lines = input.isBlank() ? List.of() : Arrays.asList(input.strip().split(\"\\\\n\"));\n    return lines.size();\n  }\n}\n`;
  }

  if (language === "cpp") {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(const string& input) {\n  // ${difficulty}: implement ${subject.concept}.\n  return input.empty() ? 0 : 1;\n}\n`;
  }

  return `def solve(input_data: str):\n    lines = input_data.strip().splitlines() if input_data.strip() else []\n    # ${difficulty}: implement ${subject.concept}.\n    return len(lines)\n`;
}

const sqlReferenceSolutions: Record<string, string> = {
  "duplicate-transactions":
    "Filter checkout rows first, group by `user_id`, keep groups with `HAVING COUNT(*) > 1`, and order by duplicate count descending plus `user_id` for deterministic review.",
  "retention-cohorts":
    "Build a signup cohort CTE from `users`, join distinct activity weeks from `events`, compute week offsets with date arithmetic, then aggregate retained users per cohort/week without counting the same user twice.",
  "window-ranking":
    "Aggregate weekly XP per user/category, apply `RANK()` or `ROW_NUMBER()` with a secondary `user_id` tie breaker, and expose only the ranked rows required by the leaderboard contract.",
  "recursive-cte":
    "Use a recursive CTE anchored at managers with no parent, append descendants while tracking a visited path, cap depth, and exclude rows that would revisit an employee id.",
  "query-plan-index":
    "Start from the dashboard WHERE and ORDER BY clauses, choose a selective composite index that matches tenant/time filters, verify with EXPLAIN, and avoid indexes that only help low-cardinality columns."
};

const shellReferenceSolutions: Record<string, string> = {
  "permissions-audit":
    "Use `find` in read-only mode, prefer `-print0` for path safety, sort deterministically, and report unreadable files before proposing any narrow permission repair.",
  "process-forensics":
    "Collect `ps` output with pid, ppid, cpu, command, combine with `pgrep -af` for the worker family, and use `lsof -Pan -p <pid>` only on matched processes.",
  "journal-triage":
    "Query `journalctl -u <unit> --since <window> -p warning..alert --no-pager`, collapse repeated stack traces, and include timestamps, boot id, and unit names.",
  "disk-pressure":
    "Use `df -h` to identify the full mount, `du -xhd1` to stay on that filesystem, sort largest paths first, and separate cleanup candidates from must-keep deploy artifacts.",
  "network-sockets":
    "Use `ss -ltnp` for listeners, join PIDs to service names with `systemctl status` or `lsof -Pan -p`, and sort by port so duplicate ownership is obvious.",
  "strict-mode-script":
    "Start scripts with `set -euo pipefail`, validate required variables before side effects, add a trap that reports the failed line, and keep dry-run behavior side-effect free.",
  "awk-metrics":
    "Parse latency rows with `awk`, group by route/status, maintain count/sum/max, and print a stable sorted report that handles missing or malformed latency fields.",
  "argument-parser":
    "Parse flags explicitly, reject unknown options, require environment and confirmation for destructive modes, and print usage before exiting non-zero on invalid combinations.",
  "parallel-jobs":
    "Use a bounded worker loop or `xargs -P`, capture each job status separately, retry only retryable failures, and summarize failed account ids at the end.",
  "sed-redaction":
    "Apply targeted token and email redactions to a copy, keep backups, avoid overbroad wildcards, and verify no bearer tokens or raw emails remain before sharing.",
  "conflict-resolution":
    "Read both sides of the conflict, preserve the intended behavior from tests, remove conflict markers, run the focused test suite, and commit the resolved logical change.",
  "bisect-regression":
    "Start `git bisect`, mark known good and bad commits, use a deterministic test command with `git bisect run`, then inspect the first bad commit before reverting or patching.",
  "interactive-rebase":
    "Group commits into reviewable units, mark debug and typo commits as fixups, reword the durable commits, and run tests after rewriting history.",
  "stash-worktree":
    "Save local work with a named stash or separate worktree, create the hotfix branch from the release base, and restore unfinished work only after the hotfix is verified.",
  "release-tag":
    "Inspect annotated tags, verify signatures when required, check tag ancestry against the release branch, and compare changelog entries to merged commits.",
  "fzf-history":
    "Use `history | fzf --preview` with clear command previews, avoid auto-executing selected destructive commands, and edit the recalled command before running.",
  "ripgrep-refactor":
    "Search with `rg --glob '!generated' --glob '!vendor'`, include context where needed, export machine-readable matches, and review candidates before replacement.",
  "tmux-incident-layout":
    "Create a named tmux session with panes for logs, health checks, queue depth, and notes, then name panes so responders can switch context quickly.",
  "jq-api-triage":
    "Use `jq` with optional chaining/defaults, group by route/status/error code, sort by latency or count, and emit request ids for drill-down.",
  "shell-navigation":
    "Use predictable aliases or directory-jump tooling, avoid aliases that hide destructive flags, and script repeated monorepo hops with clear names."
};

const codingReferenceStrategies: Record<string, string> = {
  "lru-cache":
    "Maintain a hash map from key to node plus a doubly linked recency list. On get or put, move the node to the front; when capacity is exceeded, remove the tail and delete its key.",
  "min-stack":
    "Store each pushed value with the minimum seen at that depth, or keep a second monotonic stack of minima. Pop both structures consistently so `get_min` remains O(1).",
  "trie-router":
    "Insert each path segment into a trie, mark terminal routes, and prefer exact segment matches before parameter or wildcard matches so `/users/me` wins over `/users/:id`.",
  "graph-union-find":
    "Initialize each node as its own parent, use path compression in `find`, union by rank or size, and decrement component count only when two roots differ.",
  "heap-scheduler":
    "Push tasks into a heap keyed by priority, cooldown readiness, creation time, and id. Pop stale or not-ready tasks carefully and preserve deterministic tie breaking.",
  "first-bad-build":
    "Use first-true binary search over a half-open range. When `is_bad(mid)` is true, move `hi` to `mid`; otherwise move `lo` past `mid`; return `-1` if no bad build exists.",
  "sliding-window-anomaly":
    "Expand the right pointer while accumulating risk, shrink from the left when the threshold is met, and track the shortest valid window without recomputing sums.",
  "dijkstra-latency":
    "Build an adjacency list, push `(distance,node)` into a min-heap, ignore stale heap entries, and relax positive-weight edges until the destination is finalized.",
  "dp-budget":
    "Use 0/1 knapsack state over budget. Iterate budget backward for each module, store best XP, and keep parent pointers when the selected module list must be reconstructed.",
  "toposort-deploy":
    "Build indegree counts and outgoing edges, enqueue zero-indegree services, emit them in stable order, and report a cycle if emitted count is smaller than service count.",
  "dataclass-parser":
    "Define a dataclass for the event boundary, validate required fields and allowed types before construction, normalize timestamps, and keep unknown payload fields isolated.",
  "iterator-batches":
    "Consume the iterable lazily with `itertools.islice`, yield tuples or lists up to the requested size, reject non-positive sizes, and never materialize the full stream.",
  "asyncio-rate-limit":
    "Wrap each request in a semaphore, apply per-request timeouts, collect results in input order, and retry only configured transient failures.",
  "typing-protocol":
    "Define a `Protocol` with the plugin methods, parameterize config/result types with generics, and accept structural implementations instead of inheritance-only plugins.",
  "pytest-debug":
    "Isolate temp files and environment with fixtures, reset module globals between tests, use parametrization for edge cases, and remove order dependence from cached state.",
  "promise-pool":
    "Start at most `limit` tasks, write each result into its original index, launch the next task when one settles, and reject or collect errors according to the contract.",
  "event-loop-trace":
    "List synchronous logs first, then microtasks from promises and `queueMicrotask`, then macrotasks such as timers; explain where rendering can be delayed.",
  "array-transform":
    "Normalize each event, filter invalid rows, reduce into a map keyed by user/category, and return a sorted immutable dashboard model.",
  "fetch-retry":
    "Wrap fetch with `AbortController`, retry only transient status codes, use exponential backoff with a cap, and return a typed error envelope for final failures.",
  "dom-storage":
    "Read JSON defensively, verify version and expiry, discard corrupted entries, and write fresh values atomically with a clear TTL.",
  "discriminated-union":
    "Model actions as a tagged union, switch on the discriminant, update state immutably, and use a `never` exhaustiveness check for future action types.",
  "generic-result":
    "Return `{ ok: true, data }` or `{ ok: false, error }`, type helpers over the generic payload and error, and keep throwing behavior outside the API boundary.",
  "type-narrowing":
    "Accept `unknown`, write type guards for event variants, validate required nested fields at runtime, and narrow before accessing payload properties.",
  "mapped-types":
    "Use `keyof Settings` and mapped types to derive dirty flags, partial update payloads, and readonly snapshots without duplicating field names.",
  "api-contract":
    "Represent endpoints as typed definitions, infer path parameters with template literal types, and map request and response shapes from the selected endpoint key.",
  "collections-frequency":
    "Normalize terms, count with `HashMap`, sort by frequency descending then term ascending, and return the top requested terms with stable tie handling.",
  "stream-pipeline":
    "Filter null or invalid records first, group with collectors, calculate summaries in one stream pipeline, and keep ordering deterministic for response snapshots.",
  "priority-queue":
    "Create a comparator for urgent priority, oldest timestamp, then lowest id, push all ready tasks into `PriorityQueue`, and poll until the schedule is complete.",
  "concurrent-counter":
    "Use `AtomicInteger` or synchronized sections for shared counters, define snapshot/reset semantics, and cover concurrent increments with repeatable tests.",
  "record-validation":
    "Put validation inside the record canonical constructor, reject invalid amount/currency/idempotency values, and keep the record immutable after construction.",
  "vector-two-pointer":
    "Walk a sorted vector with left and right pointers, use wide integer sums to avoid overflow, and count valid pairs while preserving O(n) complexity.",
  "unordered-map-cache":
    "Define equality and hash for the composite key, reserve capacity when size is known, bucket timestamps deliberately, and handle collisions through normal map semantics.",
  "raii-file-guard":
    "Own the file handle in a RAII wrapper, close in the destructor, delete copy operations, implement move transfer, and leave moved-from guards empty.",
  "heap-merge":
    "Seed a min-heap with the first item from each stream, pop the earliest timestamp with shard tie breaker, then push the next item from that same stream.",
  "bitset-flags":
    "Define enum-backed bit positions, combine flags with masks, provide set/clear/has helpers, and test unknown or out-of-range flags explicitly.",
  "log-parser":
    "Anchor the pattern, use named groups for timestamp, level, optional request id, and message, and reject partial-line matches.",
  "email-redaction":
    "Match practical email boundaries, replace only the local part while preserving domain context, and avoid matching URLs or invalid address-like strings.",
  "semantic-version":
    "Anchor the regex, capture major/minor/patch numbers without leading zeros, optionally capture prerelease/build metadata, and reject incomplete versions.",
  "lookaround-token":
    "Constrain matches to assignment-like contexts with lookarounds or explicit prefixes, avoid comments/prose, and capture only the token value.",
  "unicode-slug":
    "Normalize text, lower-case safely, remove unsupported punctuation, replace whitespace with single dashes, and preserve allowed Unicode letter/number classes."
};

function solutionFor({ type, language, subject }: { type: ChallengeType; language: string; subject: SubjectBlueprint }) {
  if (type === "SQL") {
    return sqlReferenceSolutions[subject.key] ?? `Write a read-only query against ${subject.artifact} that demonstrates ${subject.concept}, handles duplicates and nulls, and orders output deterministically.`;
  }

  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") {
    return shellReferenceSolutions[subject.key] ?? `Use a safe shell pipeline for ${subject.artifact}. Quote paths, avoid destructive commands, and sort output deterministically while focusing on ${subject.concept}.`;
  }

  if (type === "MULTIPLE_CHOICE" || type === "API_CHALLENGE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE") {
    return `B. Preserve correctness, deterministic behavior, and explicit failure handling. For ${subject.title}, that means reasoning about ${subject.concept} before optimizing the happy path.`;
  }

  if (type === "DEBUGGING" || type === "SECURITY_DEBUGGING") {
    return `Patch by reproducing the ${subject.title} failure with a minimal test, identifying the boundary described by ${subject.artifact}, fixing the source cause, and adding a regression test that fails before the fix.`;
  }

  const strategy = codingReferenceStrategies[subject.key];
  if (strategy) {
    return strategy;
  }

  if (language === "typescript") {
    return `export function solve(input: string): number {\n  const lines = input.trim() ? input.trim().split(\"\\n\") : [];\n  const seen = new Set<string>();\n  for (const line of lines) {\n    const value = line.trim();\n    if (value) seen.add(value);\n  }\n  return seen.size;\n}\n`;
  }

  if (language === "javascript") {
    return `export function solve(input) {\n  const lines = input.trim() ? input.trim().split(\"\\n\") : [];\n  return new Set(lines.map((line) => line.trim()).filter(Boolean)).size;\n}\n`;
  }

  if (language === "java") {
    return `import java.util.*;\n\nclass Solution {\n  public int solve(String input) {\n    Set<String> seen = new HashSet<>();\n    if (!input.isBlank()) {\n      for (String line : input.strip().split(\"\\\\n\")) {\n        if (!line.isBlank()) seen.add(line.strip());\n      }\n    }\n    return seen.size();\n  }\n}\n`;
  }

  if (language === "cpp") {
    return `#include <bits/stdc++.h>\nusing namespace std;\n\nint solve(const string& input) {\n  unordered_set<string> seen;\n  stringstream ss(input);\n  string line;\n  while (getline(ss, line)) {\n    if (!line.empty()) seen.insert(line);\n  }\n  return static_cast<int>(seen.size());\n}\n`;
  }

  return `def solve(input_data: str) -> int:\n    return len({line.strip() for line in input_data.splitlines() if line.strip()})\n`;
}

function publicTestsFor(type: ChallengeType, subject: SubjectBlueprint) {
  if (type === "SQL") {
    return [
      { name: "returns read-only result set", query: "SELECT or WITH only", expected: "no mutation statements" },
      { name: "uses deterministic ordering", query: "ORDER BY", expected: "stable review output" },
      { name: "models the target concept", query: subject.concept, expected: subject.tags[0] }
    ];
  }

  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") {
    return [
      { name: "uses safe command composition", command: "pipeline", expected: "deterministic command sequence" },
      { name: "handles ordinary filenames", command: "sort or stable filter", expected: "stable output" },
      { name: "targets the incident artifact", command: subject.artifact, expected: subject.tags[0] }
    ];
  }

  if (type === "MULTIPLE_CHOICE" || type === "API_CHALLENGE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE") {
    return [
      { name: "selects the safest option", answer: "B", expected: "B" },
      { name: "includes justification", expected: "mentions correctness or risk" }
    ];
  }

  if (type === "DEBUGGING" || type === "SECURITY_DEBUGGING") {
    return [
      { name: "reproduces the reported failure", input: subject.scenario, expected: "minimal failing case" },
      { name: "adds a regression test", input: subject.artifact, expected: "test fails before fix" }
    ];
  }

  return [
    { name: "sample case", input: `${subject.key}\ncase\n${subject.key}\n`, expected: 2 },
    { name: "empty input", input: "", expected: 0 },
    { name: "trims duplicate-looking values", input: " alpha \nalpha\nbeta\n", expected: 2 }
  ];
}

function hiddenTestsFor(type: ChallengeType, subject: SubjectBlueprint, difficulty: Difficulty) {
  if (type === "SQL") {
    return [
      { name: "tie-heavy rows", expected: "secondary ORDER BY prevents flapping" },
      { name: "null and duplicate records", expected: "correct grouping without mutation" }
    ];
  }

  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") {
    return [
      { name: "paths with spaces", expected: "quoted or null-delimited handling" },
      { name: "large listing", expected: "does not rely on manual inspection" }
    ];
  }

  if (type === "MULTIPLE_CHOICE" || type === "API_CHALLENGE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE") {
    return [{ name: "risk-aware explanation", expected: "mentions tradeoff, compatibility, or safety" }];
  }

  if (type === "DEBUGGING" || type === "SECURITY_DEBUGGING") {
    return [
      { name: "root-cause clarity", expected: "fix addresses source, not symptom" },
      { name: "regression coverage", expected: "test covers the reported failure mode" }
    ];
  }

  return [
    {
      name: `${difficulty.toLowerCase()} scale case`,
      input: Array.from({ length: difficulty === "INSANE" ? 2500 : 400 }, (_, index) => `${subject.key}-${index % 97}`).join("\n"),
      expected: 97
    },
    { name: "unicode and whitespace", input: "Angstrom\nangstrom\n  beta  \n", expected: "normalization decision documented" }
  ];
}

function validationMetadataFor(type: ChallengeType, subject: SubjectBlueprint, language: string, difficulty: Difficulty) {
  const commonForbidden = ["eval", "exec", "rm -rf", "DROP", "TRUNCATE", "DELETE FROM"];

  if (type === "SQL") {
    return {
      kind: type,
      complexityTarget: difficulty === "EASY" ? "Readable single-pass aggregate or join" : "Planner-aware read-only query with deterministic output",
      forbiddenPatterns: ["DROP", "TRUNCATE", "DELETE", "UPDATE", "INSERT", "ALTER", "COPY PROGRAM", "EXECUTE"],
      sql: {
        dialect: "postgresql" as const,
        schema: subject.artifact,
        seedRows: [
          { id: 1, user_id: "u_1", status: "checkout", amount_cents: 4200, created_at: "2026-04-01T10:00:00Z" },
          { id: 2, user_id: "u_1", status: "checkout", amount_cents: 4200, created_at: "2026-04-01T10:01:00Z" },
          { id: 3, user_id: "u_2", status: "refund", amount_cents: 900, created_at: "2026-04-02T12:00:00Z" }
        ],
        expectedResult: `A deterministic result proving ${subject.concept}`,
        forbiddenStatements: ["DROP", "TRUNCATE", "DELETE", "UPDATE", "INSERT", "ALTER", "GRANT", "REVOKE"],
        validationQuery: "EXPLAIN is optional; submitted SQL must be SELECT/CTE-only and produce the expected row shape."
      }
    };
  }

  if (type === "LINUX" || type === "BASH_SCRIPTING") {
    return {
      kind: type,
      complexityTarget: "Linear scan over simulated files/log rows with deterministic output",
      forbiddenPatterns: ["rm -rf", "mkfs", "dd if=", "shutdown", "reboot", "chmod 777 /", "curl ... | sh"],
      linux: {
        simulatedFilesystem: [
          { path: "/arena/workspace/input.log", type: "file" as const, mode: "0640", owner: "app", content: `${subject.key} sample row\nerror request_id=req_1\n` },
          { path: "/arena/workspace/archive/with spaces.txt", type: "file" as const, mode: "0600", owner: "root", content: "edge case payload\n" },
          { path: "/arena/workspace/output", type: "directory" as const, mode: "0755", owner: "app" }
        ],
        allowedCommands: ["awk", "cat", "cut", "du", "df", "find", "grep", "head", "journalctl", "jq", "printf", "ps", "rg", "sed", "sort", "ss", "tail", "uniq", "xargs"],
        forbiddenOperations: ["delete files", "format disks", "change root ownership", "download and execute scripts"],
        expectedOutput: `Stable report for ${subject.title}`
      }
    };
  }

  if (type === "GIT_WORKFLOW") {
    return {
      kind: type,
      complexityTarget: "Command sequence preserves work, history intent, and verification signal",
      forbiddenPatterns: ["git reset --hard without backup", "force push to main", "delete untracked work blindly"],
      git: {
        initialRepoState: subject.artifact,
        requiredFinalState: `Repository state demonstrates ${subject.concept} and includes verification notes.`,
        commandValidation: ["uses safe inspection commands", "preserves unfinished work", "runs a verification command"],
        forbiddenOperations: ["destructive reset without backup", "rewriting shared history without review", "discarding untracked files"]
      }
    };
  }

  if (type === "MULTIPLE_CHOICE" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE") {
    return {
      kind: type,
      complexityTarget: "Correct option plus risk-aware explanation",
      multipleChoice: {
        correctAnswer: "B" as const,
        options: [
          { id: "A" as const, text: "Optimize the fastest happy path first.", explanation: "Incomplete because it ignores edge cases and operational risk." },
          { id: "B" as const, text: "Preserve correctness, deterministic behavior, and explicit failure handling.", explanation: "Best because it matches the arena's reliability and learning objective." },
          { id: "C" as const, text: "Trust upstream data and skip validation.", explanation: "Unsafe because real systems receive malformed and adversarial input." },
          { id: "D" as const, text: "Mutate production state first, then inspect.", explanation: "Unsafe because investigation should minimize blast radius." }
        ]
      }
    };
  }

  if (type === "API_CHALLENGE") {
    return {
      kind: type,
      complexityTarget: "Contract remains stable under retries, pagination, errors, and abuse cases",
      forbiddenPatterns: commonForbidden,
      api: {
        endpoint: `/api/training/${subject.key}`,
        method: subject.key.includes("pagination") ? ("GET" as const) : ("POST" as const),
        requestShape: { request_id: "req_123", tenant_id: "tenant_a", payload: subject.artifact },
        expectedResponse: { ok: true, data: `response that demonstrates ${subject.concept}`, request_id: "req_123" },
        failureModes: ["timeout", "429 rate limit", "malformed JSON", "duplicate retry", "missing authentication context"]
      }
    };
  }

  if (type === "SYSTEM_DESIGN_MINI") {
    return {
      kind: type,
      complexityTarget: "Architecture answer names constraints, tradeoffs, and failure modes",
      systemDesign: {
        constraints: ["latency budget", "reliability target", "data growth", "operational visibility"],
        evaluationRubric: ["states assumptions", "selects appropriate primitive", "explains tradeoffs", "defines observability signal"],
        tradeoffs: ["consistency vs latency", "cost vs durability", "simplicity vs scalability"]
      }
    };
  }

  if (type === "DEBUGGING" || type === "SECURITY_DEBUGGING") {
    return {
      kind: type,
      complexityTarget: "Minimal reproduction, source-cause fix, and regression test",
      forbiddenPatterns: commonForbidden,
      debugging: {
        brokenCode: starterCodeFor({ type, language, subject, difficulty }),
        expectedFixedBehavior: `Fix should satisfy ${subject.concept} without masking the symptom.`,
        rootCause: `Boundary failure around ${subject.artifact}`,
        regressionTests: ["reported scenario fails before patch", "edge case remains fixed", "normal path still works"]
      }
    };
  }

  return {
    kind: type,
    complexityTarget: difficulty === "EASY" ? "Readable O(n) or O(n log n) baseline" : "Meets expected complexity under hidden scale cases",
    forbiddenPatterns: commonForbidden,
    code: {
      functionName: language === "java" ? "solve" : "solve",
      inputFormat: subject.artifact,
      outputFormat: `Return the value or structure required to demonstrate ${subject.concept}.`,
      expectedComplexity: difficulty === "INSANE" ? "Optimized for adversarial input; avoid avoidable quadratic behavior" : "Avoid unnecessary nested scans unless justified",
      edgeCases: ["empty input", "duplicates", "large input", "ordering ties", "malformed rows"]
    }
  };
}

function hintsFor(type: ChallengeType, subject: SubjectBlueprint, difficulty: Difficulty) {
  const typeHint =
    type === "SQL"
      ? "Keep the query read-only and make ordering deterministic."
      : type === "LINUX"
        ? "Prefer safe pipelines and quote or null-delimit anything that may be a path."
      : type === "DEBUGGING" || type === "SECURITY_DEBUGGING"
          ? "Write the smallest reproduction before patching the broad code path."
          : type === "MULTIPLE_CHOICE" || type === "API_CHALLENGE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION" || type === "BOSS_STAGE"
            ? "Eliminate options that skip validation, mutate first, or optimize before proving correctness."
            : "Name the invariant before choosing the data structure or loop shape.";

  return [`Focus on ${subject.concept}.`, typeHint, `${difficultyMeta[difficulty].instructionDepth}`];
}

function buildChallenge(category: CategoryBlueprint, subject: SubjectBlueprint, difficulty: Difficulty, subjectIndex: number) {
  const type = typeForSubject(category, subject, difficulty);
  const language = languageFor(category.categorySlug, type, subject.language ?? category.language);
  const meta = difficultyMeta[difficulty];
  const categoryDisplay = categoryName(category.categorySlug);
  const slug = `${category.categorySlug}-${difficulty.toLowerCase()}-${subject.key}`;
  const xpReward = difficultyXp[difficulty] + meta.xpOffset + subjectIndex * 5;

  return {
    slug,
    title: `${meta.verb} ${subject.title}`,
    subtitle: `${meta.label} ${categoryDisplay} arena: ${subject.concept}`,
    description: `${categoryDisplay} challenge on ${subject.concept}. Solve ${meta.scope} useful for real work and technical interviews.`,
    story: `${subject.scenario} You are working inside ${category.workplace}, and the arena only clears when the result is safe, deterministic, and explainable.`,
    learningObjective: `Learn to apply ${subject.concept} in ${category.workplace} while explaining the invariant, safety constraints, and hidden edge cases.`,
    instructions: `${subject.artifact} ${meta.instructionDepth} Submit the solution plus enough reasoning to pass hidden edge cases.`,
    categorySlug: category.categorySlug,
    difficulty,
    type,
    status: "PUBLISHED" as const,
    tags: [...new Set([...subject.tags, category.categorySlug, difficulty.toLowerCase(), type.toLowerCase().replaceAll("_", "-")])],
    prerequisites: difficulty === "EASY" ? [] : [`${category.categorySlug}-easy-${subject.key}`],
    xpReward,
    coinReward: Math.max(8, Math.round(xpReward / 12)),
    starterCode: starterCodeFor({ type, language, subject, difficulty }),
    language,
    testCases: publicTestsFor(type, subject),
    hiddenTestCases: hiddenTestsFor(type, subject, difficulty),
    validationMetadata: validationMetadataFor(type, subject, language, difficulty),
    examples: publicTestsFor(type, subject).slice(0, 2),
    hints: hintsFor(type, subject, difficulty),
    solution: solutionFor({ type, language, subject }),
    explanation: `${subject.title} reinforces ${subject.concept}. A strong solution defines the invariant, handles edge cases described by the artifact, keeps output deterministic, and explains why the chosen approach is safe at ${meta.label.toLowerCase()} difficulty.`,
    successCriteria: [
      `Demonstrates ${subject.concept}`,
      "Handles the visible sample and hidden edge cases",
      "Keeps output deterministic and explainable",
      type === "SQL" ? "Stays read-only" : type === "LINUX" ? "Avoids destructive host commands" : "Avoids unsafe dynamic execution"
    ],
    relatedChallenges: [],
    estimatedTime: meta.time + subjectIndex * 3,
    unlockRules: {
      requiredCompletions: unlockRequirements[difficulty]
    },
    featured: difficulty === "EASY" && subjectIndex === 0
  } satisfies GeneratedChallenge;
}

export function generateChallenges(): GeneratedChallenge[] {
  const coreChallenges = blueprints.flatMap((category) =>
    category.subjects.flatMap((subject, subjectIndex) =>
      (["EASY", "MEDIUM", "HARD", "EXTREME", "INSANE"] as Difficulty[]).map((difficulty) =>
        buildChallenge(category, subject, difficulty, subjectIndex)
      )
    )
  );

  const roundRobinSubjects: Array<{ category: CategoryBlueprint; subject: SubjectBlueprint; subjectIndex: number }> = [];
  const maxSubjects = Math.max(...blueprints.map((category) => category.subjects.length));
  for (let subjectIndex = 0; subjectIndex < maxSubjects; subjectIndex += 1) {
    for (const category of blueprints) {
      const subject = category.subjects[subjectIndex];
      if (subject) roundRobinSubjects.push({ category, subject, subjectIndex });
    }
  }

  const expansionSubjects = roundRobinSubjects.slice(0, 40);
  const expansionChallenges = expansionSubjects.flatMap(({ category, subject, subjectIndex }) => {
    const easyVariant: SubjectBlueprint = {
      ...subject,
      key: `${subject.key}-diagnostic`,
      title: `${subject.title} diagnostic drill`,
      scenario: `A learner is about to attempt the full ${subject.title} arena. Build a smaller but realistic diagnostic that exposes whether they understand ${subject.concept}.`,
      artifact: `${subject.artifact} Include one normal case, one malformed case, and one ordering or safety edge case.`,
      tags: [...subject.tags, "diagnostic", "first-10-minutes"]
    };
    const mediumVariant: SubjectBlueprint = {
      ...subject,
      key: `${subject.key}-edge-lab`,
      title: `${subject.title} noisy edge lab`,
      scenario: `The initial ${subject.title} solution worked on clean data, but production-like noise now exposes weak assumptions.`,
      artifact: `${subject.artifact} Add duplicate rows, missing values, tie cases, and one input that should be rejected safely.`,
      tags: [...subject.tags, "edge-cases", "production-noise"]
    };

    return [
      buildChallenge(category, easyVariant, "EASY", subjectIndex + 10),
      buildChallenge(category, mediumVariant, "MEDIUM", subjectIndex + 10)
    ];
  });

  const generated = [...coreChallenges, ...expansionChallenges];

  const seen = new Set<string>();
  for (const challenge of generated) {
    if (seen.has(challenge.slug)) throw new Error(`Duplicate challenge slug generated: ${challenge.slug}`);
    seen.add(challenge.slug);
  }

  return generated;
}

const curatedChallengeUpdates: Record<string, Partial<GeneratedChallenge>> = {
  "linux-easy-permissions-audit": {
    title: "Repair a locked deployment directory",
    description:
      "Inspect a deployment directory with broken Unix permissions and produce a safe command pipeline that identifies unreadable files without changing ownership blindly.",
    story:
      "A release failed because the app user cannot read several files under ./deploy. The incident commander needs a deterministic inspection command, not a broad chmod hammer.",
    instructions:
      "Write shell commands that find files under ./deploy that are not readable by the current user, print stable relative paths, and avoid destructive permission changes.",
    tags: ["permissions", "linux", "find", "sort", "quoting"],
    starterCode:
      "# Inspect unreadable files safely.\n# Requirements: handle spaces in paths, stable output, no chmod 777.\nfind ./deploy -type f ! -readable -print | sort\n",
    testCases: [
      { name: "finds unreadable files", command: "find", expected: "relative unreadable file paths" },
      { name: "prints stable output", command: "sort", expected: "stable order" }
    ],
    hiddenTestCases: [{ name: "space-containing paths", expected: "quoted or null-safe path handling" }],
    hints: [
      "Start with `find ./deploy -type f ! -readable` before thinking about repairs.",
      "Stable output matters for incident diffs; pipe through `sort` or use deterministic traversal.",
      "Do not use `chmod 777`; the task is inspection, not broad mutation."
    ],
    solution: "find ./deploy -type f ! -readable -print0 | sort -z | xargs -0 -I{} printf '%s\\n' '{}'",
    explanation:
      "The safest response is to inspect unreadable files with `find`, keep output deterministic, and use null-delimited handling when paths can contain spaces."
  },
  "sql-easy-duplicate-transactions": {
    title: "Find duplicate checkout transactions",
    description:
      "Write a read-only SQL query that identifies users with repeated checkout transactions and orders the result for deterministic review.",
    story:
      "Payments noticed duplicate checkout events after a retry storm. You need a query that highlights affected users without mutating production data.",
    instructions:
      "Return `user_id` and `duplicate_count` for users with more than one checkout transaction. Use grouping and deterministic ordering.",
    tags: ["transactions", "sql", "group-by", "order-by", "read-only"],
    starterCode:
      "-- transactions(id, user_id, order_id, status, amount_cents, created_at)\nSELECT user_id, COUNT(*) AS duplicate_count\nFROM transactions\nWHERE status = 'checkout'\nGROUP BY user_id\nHAVING COUNT(*) > 1\nORDER BY duplicate_count DESC, user_id ASC;",
    testCases: [
      { name: "groups by user", query: "GROUP BY user_id", expected: "duplicate users only" },
      { name: "orders deterministically", query: "ORDER BY", expected: "stable tie order" }
    ],
    hiddenTestCases: [{ name: "tie-heavy duplicate counts", expected: "secondary order by user_id" }],
    hints: [
      "Filter to checkout events before grouping.",
      "Use `HAVING COUNT(*) > 1` after `GROUP BY`.",
      "Add a secondary sort so two users with the same count do not flap between runs."
    ],
    solution:
      "SELECT user_id, COUNT(*) AS duplicate_count FROM transactions WHERE status = 'checkout' GROUP BY user_id HAVING COUNT(*) > 1 ORDER BY duplicate_count DESC, user_id ASC;",
    explanation:
      "Filtering first keeps the aggregate focused, `HAVING` removes non-duplicates, and deterministic ordering makes incident review repeatable."
  },
  "algorithms-medium-first-bad-build": {
    title: "Binary search the first bad build",
    description:
      "Implement a first-true binary search that returns the earliest failing build while avoiding infinite loops and off-by-one errors.",
    story:
      "A deploy train has 80 builds and one regression. Linear search is too slow for the arena timer, so you need the first build where `is_bad(build)` becomes true.",
    instructions: "Implement `solve(input)` using binary search. Handle empty ranges, one-element ranges, and all-good data.",
    tags: ["binary search", "algorithms", "edge", "first-true"],
    hints: [
      "Use a half-open range when possible: `lo` inclusive, `hi` exclusive.",
      "When the midpoint is bad, keep it in the search range.",
      "Return a sentinel such as `-1` when no build is bad."
    ],
    explanation:
      "First-true binary search keeps the candidate bad build when the predicate succeeds and discards only ranges that cannot contain the first failure."
  }
};

function attachRelatedChallenges(challenges: GeneratedChallenge[]) {
  const difficultyOrder: Record<Difficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3, EXTREME: 4, INSANE: 5 };
  return challenges.map((challenge) => {
    const relatedChallenges = challenges
      .filter((candidate) => candidate.slug !== challenge.slug)
      .filter((candidate) => candidate.categorySlug === challenge.categorySlug)
      .filter((candidate) => candidate.tags.some((tag) => challenge.tags.includes(tag)))
      .sort((a, b) => {
        const difficultyDistance = Math.abs(difficultyOrder[a.difficulty] - difficultyOrder[challenge.difficulty]) - Math.abs(difficultyOrder[b.difficulty] - difficultyOrder[challenge.difficulty]);
        if (difficultyDistance !== 0) return difficultyDistance;
        return a.estimatedTime - b.estimatedTime;
      })
      .slice(0, 5)
      .map((candidate) => candidate.slug);

    return {
      ...challenge,
      relatedChallenges
    };
  });
}

export const challengeCatalog = attachRelatedChallenges(
  generateChallenges().map((challenge) => ({
    ...challenge,
    ...(curatedChallengeUpdates[challenge.slug] ?? {})
  }))
);

export function getChallengeBySlug(slug: string) {
  return challengeCatalog.find((challenge) => challenge.slug === slug) ?? null;
}

export function getFeaturedChallenges(limit = 8) {
  return challengeCatalog.filter((challenge) => challenge.featured).slice(0, limit);
}
