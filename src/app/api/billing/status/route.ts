import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBillingSnapshot } from "@/lib/billing/usage";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const snapshot = await getUserBillingSnapshot(session?.user?.id);
  const subscription =
    session?.user?.id && (await canReachDatabase())
      ? await prisma.userSubscription.findFirst({
          where: { userId: session.user.id },
          orderBy: { updatedAt: "desc" },
          select: {
            status: true,
            billingInterval: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            trialEndsAt: true,
            stripeCustomerId: true
          }
        }).catch(() => null)
      : null;

  return Response.json({
    plan: snapshot.plan,
    entitlements: snapshot.entitlements,
    usage: {
      daily: snapshot.dailyUsage,
      monthly: snapshot.monthlyUsage
    },
    limits: snapshot.limits,
    subscription: subscription
      ? {
          status: subscription.status,
          billingInterval: subscription.billingInterval,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          trialEndsAt: subscription.trialEndsAt,
          hasStripeCustomer: Boolean(subscription.stripeCustomerId)
        }
      : null
  });
}
