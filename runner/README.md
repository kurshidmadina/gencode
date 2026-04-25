# Gencode Runner Service Contract

The production runner is intentionally separate from the Next.js app. The app should enqueue signed jobs; the runner should execute them in isolated containers or microVMs and return structured results.

## Request

```json
{
  "submissionId": "sub_123",
  "challengeSlug": "python-medium-iterator-batches",
  "language": "python",
  "source": "def solve(input_data): ...",
  "tests": [{ "name": "sample", "input": "...", "expected": "..." }],
  "limits": { "timeoutMs": 3000, "memoryMb": 128 }
}
```

## Response

```json
{
  "status": "PASSED",
  "score": 100,
  "runtime": 42,
  "memory": 31,
  "testResults": [
    { "name": "sample", "passed": true, "expected": "2", "actual": "2", "message": "ok" }
  ]
}
```

## Isolation Checklist

- No host filesystem mounts except read-only tests and ephemeral workspace
- No network by default
- CPU, memory, process, and wall-clock limits
- Per-job user namespace
- Structured logs without secrets
- Signed app-to-runner requests

See `docs/CHALLENGE_RUNNER_SECURITY.md` for the full production isolation model.
