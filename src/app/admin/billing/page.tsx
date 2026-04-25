import type { LucideIcon } from "lucide-react";
import { CreditCard, DollarSign, RefreshCcw, Users } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingPlans } from "@/lib/billing/plans";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = { title: "Admin Billing" };

async function getBillingStats() {
  if (!(await canReachDatabase())) {
    return { subscriptions: 0, paid: 0, free: 1, canceled: 0, failed: 0, teams: 0, mrr: 0, leads: 0, planCounts: [] as Array<{ planId: string; count: number }> };
  }
  const [subscriptions, users, teams, leads, grouped] = await Promise.all([
    prisma.userSubscription.findMany({ include: { plan: true }, take: 500 }),
    prisma.user.count(),
    prisma.team.count(),
    prisma.salesLead.count(),
    prisma.userSubscription.groupBy({ by: ["planId"], _count: true })
  ]);
  const active = subscriptions.filter((item) => item.status === "ACTIVE" || item.status === "TRIALING");
  const mrr = active.reduce((sum, item) => sum + (item.billingInterval === "YEARLY" ? Math.round((item.plan.yearlyPrice ?? 0) / 12) : (item.plan.monthlyPrice ?? 0)), 0);
  return {
    subscriptions: subscriptions.length,
    paid: active.filter((item) => item.planId !== "free").length,
    free: Math.max(0, users - active.filter((item) => item.planId !== "free").length),
    canceled: subscriptions.filter((item) => item.status === "CANCELED").length,
    failed: subscriptions.filter((item) => item.status === "PAST_DUE" || item.status === "UNPAID").length,
    teams,
    mrr,
    leads,
    planCounts: grouped.map((item) => ({ planId: item.planId, count: item._count }))
  };
}

export default async function AdminBillingPage() {
  await requireAdmin();
  const stats = await getBillingStats();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-7">
          <Badge variant="gold">
            <CreditCard className="h-3.5 w-3.5" />
            Billing ops
          </Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Revenue command center.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Subscription health, plan distribution, sales leads, team accounts, and demo MRR signals. Treat seeded metrics as demo-only.
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-4">
          {([
            [DollarSign, "Demo MRR", `$${stats.mrr}`],
            [CreditCard, "Paid subscriptions", stats.paid],
            [RefreshCcw, "Failed/past-due", stats.failed],
            [Users, "Teams", stats.teams]
          ] satisfies Array<[LucideIcon, string, string | number]>).map(([Icon, label, value]) => (
            <Card key={String(label)}>
              <CardHeader>
                <Icon className="h-6 w-6 text-cyan-100" />
                <CardTitle className="text-sm text-slate-400">{String(label)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{String(value)}</div>
              </CardContent>
            </Card>
          ))}
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{stats.planCounts.find((item) => item.planId === plan.id)?.count ?? 0}</div>
                <p className="mt-2 text-sm text-slate-400">{plan.targetAudience}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </AppFrame>
  );
}
