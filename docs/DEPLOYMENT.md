# Deployment

Gencode is designed to deploy as a Next.js application with PostgreSQL, Prisma migrations, and optional external services for the AI provider and production challenge runner.

## Required Production Environment

Set these variables in the hosting provider before promoting a production deployment:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NEXTAUTH_SECRET="a-long-random-secret-at-least-32-characters"
NEXTAUTH_URL="https://your-production-domain"
ASSISTANT_PROVIDER="mock"
RUNNER_PROVIDER="mock"
```

Use `openssl rand -base64 48` to generate `NEXTAUTH_SECRET`.

For Vercel, add the variables under Project Settings -> Environment Variables for Production and Preview. Environment variable changes only affect new deployments.

## Vercel Deployment Checklist

1. Create or attach a managed PostgreSQL database.
2. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ASSISTANT_PROVIDER`, and `RUNNER_PROVIDER`.
3. Run migrations against the production database:

```bash
vercel env pull .env.production.local
npm run db:deploy
```

or, when Vercel CLI environment execution is available:

```bash
vercel env run -e production -- npm run db:deploy
```

4. Seed only when intentionally preparing a demo environment:

```bash
npm run db:seed
```

5. Deploy preview first:

```bash
vercel deploy
```

6. Promote production only after checks pass:

```bash
vercel --prod
```

## Build-Time Env Behavior

`next build` imports shared app frame and auth modules while collecting static page data. Gencode avoids requiring `DATABASE_URL` merely to render static logged-out chrome during build, but runtime production deployments still need real `DATABASE_URL` and a strong `NEXTAUTH_SECRET`.

## Runner Deployment

The default `RUNNER_PROVIDER=mock` is safe and deterministic. Before enabling arbitrary user code execution, deploy the isolated runner service described in `docs/CHALLENGE_RUNNER_SECURITY.md` with strict CPU, memory, filesystem, process, timeout, and network limits.

## Promotion Model

Recommended branches:

- `dev-server`: development environment
- `testing-server`: staging or QA
- `main`: production

Promote by fast-forwarding or merging verified commits from feature branches into `dev-server`, then `testing-server`, then `main`.
