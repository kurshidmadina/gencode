# Gencode Architecture

Gencode is a Next.js App Router application backed by PostgreSQL and Prisma. The product surface is organized around a daily training loop:

1. Onboarding calibration stores learner goals and recommends a learning path.
2. Learning paths order challenge missions into milestones and boss gates.
3. Challenge pages run a safe local judge and persist submissions/progress.
4. Genie uses a provider abstraction for mock or OpenAI-compatible mentoring.
5. Arena, boss battles, map, VR, shop, leaderboards, dashboard, and profiles turn progress into an RPG-style product loop.

## Boundaries

- `src/app`: routes, API handlers, protected pages, loading/error states.
- `src/components`: UI surfaces and client experiences.
- `src/lib/game`: challenge generation, progression, paths, bosses, quests, arena scoring, shop catalog.
- `src/lib/assistant`: Genie provider abstraction and guardrails.
- `src/lib/security`: rate limits and admin audit helpers.
- `prisma`: relational schema, migrations, seed data.
- `runner`: production runner contract and isolation notes.

## Session Systems

- `ArenaRun` stores timed practice mode history, challenge draws, score, accuracy, bonuses, and completion status.
- `UserBossBattleProgress` stores each user's current boss gate state.
- `BossBattleStageAttempt` stores individual boss-stage starts and clears for analytics and profile history.
- Admin analytics reads arena and boss usage alongside submissions, Genie messages, VR sessions, and audit logs.

## Production Shape

The Next.js app should never execute arbitrary user code directly. Production submissions should be queued to an isolated runner service. The app stores content, users, progress, and results; the runner owns language execution and returns structured JSON.
