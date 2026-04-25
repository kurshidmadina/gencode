# Gencode Billing

Gencode billing is built around server-side plan enforcement. UI prompts are conversion moments, but the API decides access.

## Plans

- Free: beginner momentum, 25 challenge attempts/month, Easy tier, 3 Genie messages/day.
- Starter: daily habit plan, Easy + Medium, 150 attempts/month, 20 Genie messages/day.
- Pro: core paid plan, Hard access, boss battles, Arena, advanced Genie modes, analytics.
- Elite: advanced mastery, Extreme/Insane, full VR/immersive mode, high-limit Genie, weakness diagnosis.
- Team: Pro-style access per seat, team dashboards, analytics, seat management foundation.
- Enterprise: custom packs, private paths, SSO-ready architecture, custom contracts and reports.

## Architecture

- `src/lib/billing/plans.ts`: central pricing config.
- `src/lib/billing/entitlements.ts`: feature checks and upgrade recommendations.
- `src/lib/billing/usage.ts`: daily/monthly usage keys, counters, and current plan resolution.
- `src/lib/billing/stripe.ts`: Stripe client, price ID lookup, status mapping.
- `src/app/api/billing/*`: checkout, portal, status, usage.
- `src/app/api/stripe/webhook`: signed webhook processing.
- `src/app/api/sales-leads`: enterprise/team lead capture.

## Safety Rules

- Never trust a client-submitted plan value for access.
- Never accept client-submitted Stripe price IDs.
- Do not store card data.
- Webhooks must verify `STRIPE_WEBHOOK_SECRET`.
- Duplicate Stripe events are ignored through `BillingEvent.stripeEventId`.
- Paid checkout responds with setup errors if Stripe env vars are missing.

## Local Behavior

Without Stripe keys, Gencode still runs. Paid buttons call the checkout route and receive a helpful setup error. This keeps local demos safe while making production billing explicit.

## Production Checklist

1. Create Stripe products and recurring prices.
2. Set Stripe environment variables in Vercel for Preview and Production.
3. Run `npm run db:deploy`.
4. Run `npm run db:seed` or sync plans through an admin job.
5. Configure the webhook endpoint: `/api/stripe/webhook`.
6. Test Checkout and Customer Portal in Stripe test mode.
