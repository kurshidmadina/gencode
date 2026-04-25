import Stripe from "stripe";
import { getServerEnv } from "@/lib/env";
import { getPlanById, getStripePriceEnvKey, type BillingInterval, type PlanId } from "@/lib/billing/plans";

let stripeClient: Stripe | null = null;

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export function getStripeClient() {
  const env = getServerEnv();
  if (!env.STRIPE_SECRET_KEY) return null;
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    appInfo: {
      name: "Gencode",
      version: "0.1.0"
    }
  });
  return stripeClient;
}

export function getStripePriceId(planId: PlanId, interval: BillingInterval) {
  const envKey = getStripePriceEnvKey(planId, interval);
  if (!envKey) return null;
  return process.env[envKey] || null;
}

export function assertCheckoutPlan(planId: PlanId, interval: BillingInterval) {
  const plan = getPlanById(planId);
  if (plan.id === "free") {
    throw new Error("Free plan does not use checkout.");
  }
  if (plan.id === "enterprise") {
    throw new Error("Enterprise plan uses the contact-sales flow.");
  }
  const priceId = getStripePriceId(plan.id, interval);
  if (!priceId) {
    throw new Error(`${interval === "monthly" ? plan.monthlyPriceEnvKey : plan.yearlyPriceEnvKey} is not configured.`);
  }
  return { plan, priceId };
}

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status) {
  const normalized = status.toUpperCase().replaceAll("-", "_");
  if (normalized === "ACTIVE" || normalized === "TRIALING" || normalized === "PAST_DUE" || normalized === "CANCELED" || normalized === "INCOMPLETE" || normalized === "INCOMPLETE_EXPIRED" || normalized === "UNPAID" || normalized === "PAUSED") {
    return normalized;
  }
  return "INCOMPLETE";
}

export function inferPlanIdFromPriceId(priceId: string | null | undefined): PlanId {
  if (!priceId) return "free";
  for (const planId of ["starter", "pro", "elite", "team"] as const) {
    if (getStripePriceId(planId, "monthly") === priceId || getStripePriceId(planId, "yearly") === priceId) return planId;
  }
  return "free";
}

export function inferIntervalFromPriceId(priceId: string | null | undefined) {
  if (!priceId) return "MONTHLY";
  for (const planId of ["starter", "pro", "elite", "team"] as const) {
    if (getStripePriceId(planId, "yearly") === priceId) return "YEARLY";
  }
  return "MONTHLY";
}
