import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { getServerEnv } from "@/lib/env";
import { canReachDatabase } from "@/lib/db-health";
import { inferIntervalFromPriceId, inferPlanIdFromPriceId, mapStripeSubscriptionStatus, getStripeClient } from "@/lib/billing/stripe";
import { syncSubscriptionPlans } from "@/lib/billing/sync-plans";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function unixToDate(value: number | null | undefined) {
  return typeof value === "number" ? new Date(value * 1000) : null;
}

function resolveId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

async function findUserId(customerId: string | null, metadataUserId?: string | null) {
  if (metadataUserId) return metadataUserId;
  if (!customerId) return null;
  const existing = await prisma.userSubscription.findFirst({
    where: { stripeCustomerId: customerId },
    select: { userId: true },
    orderBy: { updatedAt: "desc" }
  });
  return existing?.userId ?? null;
}

async function upsertSubscription(subscription: Stripe.Subscription, metadataUserId?: string | null) {
  const subscriptionWithPeriods = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const customerId = resolveId(subscription.customer);
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const planId = inferPlanIdFromPriceId(priceId);
  const userId = await findUserId(customerId, metadataUserId ?? subscription.metadata.userId);
  if (!userId) return;

  await syncSubscriptionPlans();
  await prisma.userSubscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      userId,
      planId,
      status: mapStripeSubscriptionStatus(subscription.status),
      billingInterval: inferIntervalFromPriceId(priceId),
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      currentPeriodStart: unixToDate(subscriptionWithPeriods.current_period_start),
      currentPeriodEnd: unixToDate(subscriptionWithPeriods.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEndsAt: unixToDate(subscription.trial_end)
    },
    create: {
      userId,
      planId,
      status: mapStripeSubscriptionStatus(subscription.status),
      billingInterval: inferIntervalFromPriceId(priceId),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodStart: unixToDate(subscriptionWithPeriods.current_period_start),
      currentPeriodEnd: unixToDate(subscriptionWithPeriods.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEndsAt: unixToDate(subscription.trial_end)
    }
  });
}

async function recordInvoice(invoice: Stripe.Invoice) {
  const customerId = resolveId(invoice.customer);
  const userId = await findUserId(customerId, invoice.metadata?.userId);
  if (!userId) return;
  await prisma.invoiceRecord.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      amountPaid: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      status: invoice.status ?? "unknown",
      hostedInvoiceUrl: invoice.hosted_invoice_url
    },
    create: {
      userId,
      stripeInvoiceId: invoice.id,
      amountPaid: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "usd",
      status: invoice.status ?? "unknown",
      hostedInvoiceUrl: invoice.hosted_invoice_url
    }
  });
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const env = getServerEnv();
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }
  if (!(await canReachDatabase())) return Response.json({ error: "Database is not reachable." }, { status: 503 });

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing Stripe signature." }, { status: 400 });

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return Response.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  const existing = await prisma.billingEvent.findUnique({ where: { stripeEventId: event.id } });
  if (existing?.processedAt) return Response.json({ received: true, duplicate: true });

  const billingEvent = existing ?? await prisma.billingEvent.create({
    data: {
      stripeEventId: event.id,
      type: event.type,
      payload: asJson(event)
    }
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = resolveId(session.subscription);
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await upsertSubscription(subscription, session.client_reference_id ?? session.metadata?.userId);
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    await upsertSubscription(event.data.object as Stripe.Subscription);
  }

  if (event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed") {
    await recordInvoice(event.data.object as Stripe.Invoice);
  }

  await prisma.billingEvent.update({
    where: { id: billingEvent.id },
    data: { processedAt: new Date() }
  });

  return Response.json({ received: true });
}
