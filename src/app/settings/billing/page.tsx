import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppFrame } from "@/components/layout/app-frame";
import { BillingStatusCard } from "@/components/billing/billing-status-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserBillingSnapshot } from "@/lib/billing/usage";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Billing Settings"
};

export default async function BillingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const snapshot = await getUserBillingSnapshot(session.user.id);
  const subscription =
    (await canReachDatabase())
      ? await prisma.userSubscription.findFirst({
          where: { userId: session.user.id },
          orderBy: { updatedAt: "desc" },
          select: {
            status: true,
            billingInterval: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            stripeCustomerId: true
          }
        }).catch(() => null)
      : null;

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-7">
          <Badge variant="cyan">Billing command deck</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Manage your Gencode plan.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Track limits, unlocks, renewal state, and upgrade paths. Stripe Checkout and Customer Portal handle payment details securely.
          </p>
        </section>

        <BillingStatusCard
          planId={snapshot.plan.id}
          subscription={subscription ? { ...subscription, hasStripeCustomer: Boolean(subscription.stripeCustomerId) } : null}
          dailyGenieUsed={snapshot.dailyUsage.genieMessagesUsed}
          dailyGenieLimit={snapshot.entitlements.genieDailyMessageLimit}
          monthlyChallengesUsed={snapshot.monthlyUsage.challengesAttempted}
          monthlyChallengeLimit={snapshot.entitlements.monthlyChallengeLimit}
        />

        <Card>
          <CardHeader>
            <CardTitle>Entitlements</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              ["Difficulties", snapshot.entitlements.allowedDifficulties.join(", ")],
              ["Learning paths", snapshot.entitlements.activeLearningPathLimit === null ? "Unlimited" : `${snapshot.entitlements.activeLearningPathLimit} active`],
              ["Boss battles", snapshot.entitlements.bossBattleAccess],
              ["Arena", snapshot.entitlements.arenaAccess],
              ["VR / immersive", snapshot.entitlements.vrAccess],
              ["Analytics", snapshot.entitlements.advancedAnalytics ? "Advanced" : "Basic"],
              ["Voice mode", snapshot.entitlements.voiceModeAccess ? "Enabled" : "Locked"],
              ["Streak protection", `${snapshot.entitlements.streakProtectionsPerMonth}/month`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-white/6 p-3">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</div>
                <div className="mt-1 font-bold text-white">{value}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
