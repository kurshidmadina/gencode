# Entitlements

Gencode uses entitlements to connect pricing with the actual learning product.

## Server-Enforced Gates

- Challenge difficulty: Free gets Easy, Starter gets Medium, Pro gets Hard, Elite gets all tiers.
- Challenge volume: Free and Starter have monthly attempt limits.
- Genie: daily message limits are enforced before provider calls.
- Arena: Free/Starter get local preview behavior; Pro+ saves runs and rewards.
- Boss battles: Starter is limited; Pro gets standard bosses; Elite gets advanced/Insane bosses.
- VR/Immersive: preview is visible, full tracked access requires Elite/Team/Enterprise.

## Utilities

- `canAccessDifficulty(plan, difficulty)`
- `canUseGenie(plan, usage)`
- `canEnterVR(plan)`
- `canAccessBossBattle(plan, difficulty)`
- `canAccessArena(plan)`
- `getUpgradeRecommendation(plan, feature)`
- `getPlanLimitMessage(plan, feature)`

## Usage Counters

`UsageCounter` stores daily and monthly period rows:

- Daily key: `YYYY-MM-DD`
- Monthly key: `YYYY-MM`

Tracked fields:

- `challengesAttempted`
- `challengesCompleted`
- `genieMessagesUsed`
- `vrSessionsUsed`
- `arenaRunsUsed`
- `bossBattlesAttempted`

## Product Principle

Gencode monetizes access, coaching depth, analytics, and team infrastructure. It does not sell XP shortcuts. Rank, badges, and progression must remain earned through challenge completion.
