# Challenge Runner Security

Gencode must never execute user code, shell commands, or SQL directly inside the Next.js application process.

## Current Local Runner

Local development uses `MockChallengeRunner`, which wraps `runSafeMockJudge`.

- No arbitrary code execution
- No host shell execution
- No SQL execution against the app database
- Deterministic scoring based on challenge type, visible metadata, hidden metadata, and safety guards
- Destructive shell patterns are blocked before scoring
- SQL challenges accept read-only query shapes only

This runner is intentionally conservative. It is enough for local product flows, demos, UI testing, and challenge metadata validation. It is not a replacement for production execution.

## Production Runner Contract

Production should set:

```bash
RUNNER_PROVIDER=remote
RUNNER_SERVICE_URL=https://runner.internal
RUNNER_JOB_SECRET=<strong signed job secret>
```

The Next.js app should enqueue a signed job containing:

- Submission id
- Challenge slug and type
- Language/runtime
- Source or answer
- Public and hidden tests
- Time and memory limits
- Network policy
- Filesystem fixtures

The runner returns a normalized result:

- `status`: `PASSED`, `FAILED`, or `PARTIAL`
- `score`
- `runtime`
- `memory`
- `testResults`
- safe diagnostic messages only

## Isolation Requirements

- Run each job in a fresh container or microVM
- Disable outbound network by default
- Mount only an ephemeral workspace and read-only fixtures
- Apply CPU, process, wall-clock, and memory limits
- Drop Linux capabilities
- Run as a non-root user
- Kill orphaned processes after timeout
- Redact secrets from logs
- Sign app-to-runner requests
- Verify replay-resistant timestamps
- Store raw submissions only in the app database, never in runner logs

## SQL Challenges

Local SQL challenges are validation-only. Production SQL challenges should run against disposable database fixtures with:

- Read-only database user where possible
- Per-job disposable schema
- Statement timeout
- Forbidden statements blocked before execution
- Result comparison with deterministic ordering
- No access to the app database

## Linux Challenges

Local Linux challenges are simulated. Production Linux labs should run in isolated containers with:

- No host mounts
- No privileged mode
- Network disabled unless a challenge explicitly requires a mock service
- Fixture filesystem copied into an ephemeral workspace
- Command allow/deny policy
- Final-state validation instead of trusting command text alone

## Audit and Observability

Every submitted answer creates a `SubmissionAuditLog`. Assistant, VR, and challenge-submission events create `UsageEvent` records. These records are for operational insight, abuse detection, and platform analytics; they should not include secrets.

