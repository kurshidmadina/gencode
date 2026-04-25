# Stripe Setup

These are startup defaults, not legal or financial advice. Prices live in `src/lib/billing/plans.ts` and can be changed before launch.

## Products and Prices

Create recurring Stripe prices for:

- Starter monthly: `$9/month`
- Starter yearly: `$90/year`
- Pro monthly: `$19/month`
- Pro yearly: `$190/year`
- Elite monthly: `$39/month`
- Elite yearly: `$390/year`
- Team monthly: `$29/user/month`
- Team yearly: `$290/user/year`

Enterprise is handled through `/contact-sales`.

## Environment Variables

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_MONTHLY_PRICE_ID=
STRIPE_STARTER_YEARLY_PRICE_ID=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_ELITE_MONTHLY_PRICE_ID=
STRIPE_ELITE_YEARLY_PRICE_ID=
STRIPE_TEAM_MONTHLY_PRICE_ID=
STRIPE_TEAM_YEARLY_PRICE_ID=
```

Use test-mode keys for Preview. Use live keys only when ready for production charges.

## Webhook

Create a Stripe webhook endpoint:

```text
https://your-domain.com/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

The webhook updates `UserSubscription`, stores `BillingEvent`, and records invoices.

## Customer Portal

Enable Stripe Customer Portal in Stripe settings. Gencode opens it from `/settings/billing` through `POST /api/billing/portal`.

## Testing

1. Start app with Stripe test keys.
2. Open `/pricing`.
3. Start checkout for Starter, Pro, Elite, or Team.
4. Use Stripe test cards.
5. Confirm `/billing/success` loads.
6. Confirm webhook updates `/settings/billing`.
