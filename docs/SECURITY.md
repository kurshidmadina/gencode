# Security Model

Gencode handles technical submissions and must treat execution as hostile.

## Implemented

- Zod validation on API payloads
- NextAuth sessions with user/admin roles
- Server-side admin route checks
- Prisma ORM for database access
- Bcrypt password hashing
- Security headers in Next.js config
- In-memory route rate limiting
- Local judge blocks destructive shell patterns
- Local SQL checks block mutating and DDL statements
- Genie blocks secret-looking messages from external providers
- Admin audit log model for sensitive mutations

## Production Requirements

- Move real code execution to isolated containers or microVMs.
- Use a durable rate-limit store such as Redis.
- Add centralized structured logging and alerting.
- Rotate secrets and use managed secret storage.
- Add CSP tuning for production editor/3D assets.
- Add background jobs for leaderboard snapshots and analytics rollups.
