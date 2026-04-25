import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { getAppUrl, getStripeClient } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`billing:portal:${session?.user?.id ?? getClientIp(request)}`, 10);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!session?.user?.id) return Response.json({ error: "Login required to manage billing." }, { status: 401 });

  const stripe = getStripeClient();
  if (!stripe) {
    return Response.json({ error: "Stripe billing portal is not configured.", setupRequired: true }, { status: 503 });
  }
  if (!(await canReachDatabase())) return Response.json({ error: "Database is not reachable." }, { status: 503 });

  const subscription = await prisma.userSubscription.findFirst({
    where: { userId: session.user.id, stripeCustomerId: { not: null } },
    orderBy: { updatedAt: "desc" }
  });
  if (!subscription?.stripeCustomerId) {
    return Response.json({ error: "No Stripe customer exists for this account yet." }, { status: 404 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${getAppUrl()}/settings/billing`
  });
  return Response.json({ url: portal.url });
}
