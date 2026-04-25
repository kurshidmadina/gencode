# Gencode

Gencode is a gamified technical-skill improvement platform for Linux, SQL, data structures, algorithms, coding languages, Git, APIs, debugging, regex, system design basics, and command-line productivity.

The app is built as a futuristic coding arena: users clear level-based challenges, earn XP and coins, unlock harder tiers, maintain streaks, climb leaderboards, collect badges, and use the built-in Genie assistant for guided hints and debugging.

## Agent Instructions

Contributors and coding agents should follow [AGENTS.md](./AGENTS.md) before changing product flows, UI, challenge data, AI assistant behavior, security-sensitive code, or verification scripts.

## Tech Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS, small shadcn-style component primitives, Framer-ready UI patterns
- Prisma ORM with PostgreSQL
- NextAuth credentials auth with Prisma adapter
- Monaco Editor for coding/SQL tasks
- xterm.js for Linux and shell challenges
- React Three Fiber / Three.js with WebXR-ready immersive mode
- Zod validation, rate limiting, security headers
- Vitest, React Testing Library, Playwright config
- Docker, docker-compose, GitHub Actions CI

## Features

- Landing page with premium arena UI, category previews, difficulty tiers, leaderboards, Genie, pricing-ready content, and VR CTA
- Signup, login, logout, protected dashboard, normal user role, admin role
- Onboarding calibration at `/onboarding`, `/onboarding/calibration`, and `/onboarding/path`
- Dashboard with XP, level, rank, coins, streak, daily quests, weak areas, active learning path, submissions, badges, and leaderboard rank
- Challenge catalog with search, category filters, difficulty filters, tags, status architecture, XP, estimated time, and locked states
- Challenge page with story, instructions, Monaco editor, xterm terminal, SQL/coding/multiple choice/debugging/data-structure modes, hints, Genie, test panel, run, submit, and reward feedback
- Flexible challenge engine schema with visible and hidden test metadata
- 16 structured learning paths, 7 boss battles, Arena Mode, Academy Map, and cosmetic reward shop
- Persisted Arena run history and boss-stage progress/attempt tracking
- Safe local mock judge plus production Docker-runner architecture notes
- 580 seeded challenge definitions across 18 categories and 5 difficulty tiers, including type-specific validation metadata
- Genie assistant provider abstraction with mock and OpenAI-compatible providers
- Voice input and speech output where browser APIs are available
- WebXR-ready VR page with fallback 3D coding room
- Admin dashboard, challenge management surface, user management surface
- Admin operations for learning paths, boss battles, quests, users, submissions, analytics, and challenge content
- Global leaderboard, public profile route, settings route, 404 page

## Local Setup

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

A development `.env.local` is included for immediate local startup. For production, replace `NEXTAUTH_SECRET` and use a managed PostgreSQL URL.

## Environment Variables

See [.env.example](./.env.example).

Required:

```bash
DATABASE_URL="postgresql://gencode:gencode@localhost:55432/gencode?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
ASSISTANT_PROVIDER="mock"
```

Optional OpenAI-compatible assistant:

```bash
ASSISTANT_PROVIDER="openai-compatible"
OPENAI_COMPATIBLE_API_KEY="..."
OPENAI_COMPATIBLE_BASE_URL="https://api.openai.com/v1"
OPENAI_COMPATIBLE_MODEL="gpt-4.1-mini"
```

## Database Setup

Start Postgres:

```bash
docker compose up -d postgres
```

Apply migrations:

```bash
npm run db:deploy
```

For iterative development:

```bash
npm run db:migrate
```

## Seed Data

```bash
npm run db:seed
```

The seed creates 18 categories, 580 challenges, 16 learning paths, 7 boss battles, quests, achievements, badges, shop items, and demo users.

To refresh only the investor-demo data without rebuilding the challenge catalog:

```bash
npm run db:seed:demo
```

Demo credentials:

- User: `demo@gencode.dev` / `GencodeDemo!2026`
- Admin: `admin@gencode.dev` / `GencodeAdmin!2026`

These credentials are local demo credentials only. Do not use them in production.

## Two-Minute Demo Flow

1. Open `/demo` or use the landing page demo CTA to launch the presenter control room.
2. Click `Enter User Demo`, use the dashboard to show XP, streak, quests, weak skills, badges, and recommended path.
3. Open a recommended mission, run tests, submit, and show XP/reward feedback.
4. Ask Genie for a hint or failed-test explanation to show contextual mentorship and answer-leak guardrails.
5. Click immersive mode and show the browser immersive room fallback with voice/keyboard commands.
6. Open `/leaderboard?scope=weekly` and `/profile/nova_cli` to show retention and shareable proof.
7. Click `Enter Admin Demo` from `/demo` or `/login`, then open `/admin` to show content, users, submissions, analytics, and safety telemetry.

## Testing

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Playwright is configured for end-to-end tests:

```bash
npm run test:e2e
```

The demo login E2E is gated so normal CI can run without seeded credentials:

```bash
RUN_DEMO_LOGIN_E2E=1 npm run test:e2e -- tests/e2e/demo.spec.ts
```

## Docker

Run the app and database:

```bash
docker compose up --build
```

The app service runs `prisma migrate deploy` before `npm run start`.

## Challenge Runner Architecture

Local development uses `MockChallengeRunner`, which wraps `runSafeMockJudge` to validate submissions with deterministic metadata checks and block destructive shell or mutating SQL patterns. It never executes arbitrary user code in the Next.js process.

Production should deploy a separate runner service:

- Next.js API creates a submission and sends a signed job to the runner queue.
- Runner starts a short-lived Docker container or Firecracker microVM per submission.
- Container runs with CPU, memory, process, filesystem, and network limits.
- Test cases are mounted read-only; submissions are mounted in an isolated workspace.
- Results are returned as structured JSON and persisted by the app.
- The app process never shells out to user code directly.

The `/runner` folder contains the runner API contract, isolation checklist, and starter Dockerfile for the dedicated execution service. See [Challenge Runner Security](docs/CHALLENGE_RUNNER_SECURITY.md) for the production isolation model.

## Genie Assistant

Genie is implemented through `src/lib/assistant/providers.ts`.

- `MockAssistantProvider` works offline and is used by default.
- `OpenAICompatibleAssistantProvider` uses `OPENAI_COMPATIBLE_*` variables.
- Guardrails withhold unsolicited full solution dumps and steer users toward hints, debugging, concepts, interviews, and coaching.
- Chat history is persisted when a user is logged in and the database is available.

## VR Mode

The `/vr` route uses React Three Fiber and browser WebXR APIs:

- If `navigator.xr` supports `immersive-vr`, the page can request a headset session.
- Without headset support, the same scene runs as a fallback 3D room.
- Voice commands use browser speech recognition where available.
- Voice output uses browser speech synthesis.

Supported command examples include "read the problem", "give me a hint", "run my code", "submit answer", "explain this error", "open next challenge", "switch to interview mode", and "exit VR".

## Key Routes

- `/` landing page
- `/about`, `/pricing`
- `/onboarding`, `/onboarding/calibration`, `/onboarding/path`
- `/dashboard`
- `/paths`, `/paths/[slug]`
- `/map`
- `/challenges`, `/challenges/[slug]`
- `/boss-battles`, `/boss-battles/[slug]`
- `/arena`
- `/shop`
- `/leaderboard`
- `/profile`, `/profile/[username]`, `/u/[username]`
- `/vr`
- `/admin`, `/admin/challenges`, `/admin/paths`, `/admin/boss-battles`, `/admin/quests`, `/admin/users`, `/admin/submissions`, `/admin/analytics`
- APIs include `/api/arena/runs`, `/api/boss-battles/[slug]/progress`, `/api/onboarding/calibration`, and challenge run/submit/hint routes.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Challenge Engine](docs/CHALLENGE_ENGINE.md)
- [Challenge Runner Security](docs/CHALLENGE_RUNNER_SECURITY.md)
- [AI Assistant](docs/AI_ASSISTANT.md)
- [VR Mode](docs/VR_MODE.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Roadmap](docs/ROADMAP.md)

## Vercel Deployment

Set production and preview environment variables before deploying:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-48"
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
ASSISTANT_PROVIDER="mock"
RUNNER_PROVIDER="mock"
```

Then apply migrations against the target database:

```bash
npm run db:deploy
```

See [Deployment](docs/DEPLOYMENT.md) for Vercel preview/production promotion, environment variable behavior, and runner deployment notes.

## Security Notes

- Zod validates route payloads.
- Sensitive routes use in-memory rate limiting.
- Admin APIs and admin pages require the `ADMIN` role.
- Next.js security headers are configured in `next.config.ts`.
- Environment variables are validated server-side; production requires a strong `NEXTAUTH_SECRET`.
- Submissions, assistant usage, and VR sessions produce audit/usage events for operational visibility.
- User passwords are hashed with bcrypt.
- Secrets are read from environment variables and never exposed to the client.
- Prisma prevents SQL injection in database access.
- Local judge blocks known destructive shell patterns and does not execute arbitrary code.
- Production code execution belongs in an isolated runner service.

## Known Limitations and Next Steps

- The local judge is intentionally safe and approximate; replace it with the isolated runner service before real code execution.
- Arena runs and boss-stage attempts now persist; the next pass should add a dedicated Arena leaderboard route and reward-granting anti-abuse rules.
- Friends/social graph is architecture-ready but not fully implemented.
- Admin create/edit forms are represented by secure APIs and management surfaces; richer inline editors for paths, bosses, quests, and shop items are the next product pass.
- Leaderboard snapshots are modeled; scheduled snapshot generation should be added with a worker or cron.
- Voice APIs depend on browser support and user permissions.
