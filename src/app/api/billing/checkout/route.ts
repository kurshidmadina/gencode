import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { checkoutSessionSchema } from "@/lib/billing/validators";
import { assertCheckoutPlan, getAppUrl, getStripeClient } from "@/lib/billing/stripe";
import { syncSubscriptionPlans } from "@/lib/billing/sync-plans";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`billing:checkout:${session?.user?.id ?? getClientIp(request)}`, 10);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!session?.user?.id) return Response.json({ error: "Login required to start checkout." }, { status: 401 });

  const parsed = checkoutSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid checkout request.", details: parsed.error.flatten() }, { status: 400 });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return Response.json(
      {
        error: "Stripe is not configured for this deployment.",
        setupRequired: true,
        message: "Add STRIPE_SECRET_KEY and the matching Stripe price ID environment variables, then redeploy."
      },
      { status: 503 }
    );
  }

  let checkoutPlan;
  try {
    checkoutPlan = assertCheckoutPlan(parsed.data.planId, parsed.data.billingInterval);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Selected plan is not configured.",
        setupRequired: true
      },
      { status: 503 }
    );
  }

  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Billing checkout cannot start." }, { status: 503 });
  }

  await syncSubscriptionPlans();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.email) return Response.json({ error: "A verified email is required for checkout." }, { status: 400 });

  const existing = await prisma.userSubscription.findFirst({
    where: { userId: user.id, stripeCustomerId: { not: null } },
    orderBy: { updatedAt: "desc" }
  });
  const customerId =
    existing?.stripeCustomerId ??
    (await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id, username: user.username ?? "" }
    })).id;

  await prisma.userSubscription.upsert({
    where: { id: existing?.id ?? "__new_checkout_placeholder__" },
    update: {
      stripeCustomerId: customerId,
      planId: checkoutPlan.plan.id,
      billingInterval: parsed.data.billingInterval === "yearly" ? "YEARLY" : "MONTHLY",
      status: "INCOMPLETE",
      stripePriceId: checkoutPlan.priceId
    },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      planId: checkoutPlan.plan.id,
      billingInterval: parsed.data.billingInterval === "yearly" ? "YEARLY" : "MONTHLY",
      status: "INCOMPLETE",
      stripePriceId: checkoutPlan.priceId
    }
  }).catch(async () => {
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        stripeCustomerId: customerId,
        planId: checkoutPlan.plan.id,
        billingInterval: parsed.data.billingInterval === "yearly" ? "YEARLY" : "MONTHLY",
        status: "INCOMPLETE",
        stripePriceId: checkoutPlan.priceId
      }
    });
  });

  const seats = checkoutPlan.plan.id === "team" ? Math.max(3, parsed.data.teamSeats ?? 3) : 1;
  const appUrl = getAppUrl();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing/cancel?plan=${checkoutPlan.plan.id}`,
    allow_promotion_codes: true,
    line_items: [{ price: checkoutPlan.priceId, quantity: seats }],
    subscription_data: {
      metadata: {
        userId: user.id,
        planId: checkoutPlan.plan.id,
        billingInterval: parsed.data.billingInterval,
        teamSeats: String(seats)
      }
    },
    metadata: {
      userId: user.id,
      planId: checkoutPlan.plan.id,
      billingInterval: parsed.data.billingInterval,
      teamSeats: String(seats)
    }
  });

  return Response.json({ url: checkoutSession.url });
}
