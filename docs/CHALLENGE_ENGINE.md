# Challenge Engine

The challenge engine supports coding, SQL, Linux terminal simulation, Bash, debugging, multiple choice, data-structure visualization, algorithm tracing, Git workflows, API scenarios, fill-in-code, output prediction, security debugging, system-design mini-scenarios, and boss stages.

Each challenge includes:

- Slug, title, subtitle, story, instructions, category, difficulty, type, tags
- XP and coin rewards
- Starter code or terminal starting state
- Visible tests, hidden tests, examples, hints, solution, explanation, success criteria
- Learning objective, type-specific validation metadata, and related challenge links
- Prerequisite slugs and unlock rules

## Validation Metadata

Every generated challenge now carries a structured `validationMetadata` object:

- Code tasks define input/output format, edge cases, and expected complexity.
- SQL tasks define dialect, schema, seed rows, expected result, forbidden statements, and validation notes.
- Linux/Bash tasks define a simulated filesystem, allowed commands, forbidden operations, and expected output.
- Git tasks define initial repo state, required final state, command validation, and forbidden operations.
- Multiple-choice and output-prediction tasks define options, correct answer, and explanations.
- Debugging and security tasks define broken code, expected fixed behavior, root cause, and regression tests.

## Local Judge

`runSafeMockJudge` is intentionally conservative. It checks submission shape, blocks destructive shell and mutating SQL patterns, and scores visible/hidden metadata signals. It is useful for local development and product flows, but not a replacement for real code execution.

## Production Runner

Use the `/runner` contract for production execution:

- Queue signed jobs from the app.
- Run each submission in a short-lived container or microVM.
- Enforce CPU, memory, process, network, and filesystem limits.
- Mount tests read-only.
- Return structured results with score, runtime, memory, and per-test feedback.

## Arena and Boss Scoring

Arena Mode uses `scoreArenaRun` to combine accuracy, speed bonus, no-hint bonus, and clear count. The app persists runs through `/api/arena/runs`.

Boss battles are multi-stage compositions over existing challenges. `/api/boss-battles/[slug]/progress` persists stage starts, stage clears, best score, and final completion state.
