import Link from "next/link";
import { CalendarClock, Crown, Sparkles } from "lucide-react";
import { CheckoutButton, ManageBillingButton } from "@/components/billing/billing-actions";
import { PlanBadge } from "@/components/billing/plan-badge";
import { UsageMeter } from "@/components/billing/usage-meter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanById, type BillingInterval, type PlanId } from "@/lib/billing/plans";

export function BillingStatusCard({
  planId,
  subscription,
  dailyGenieUsed,
  dailyGenieLimit,
  monthlyChallengesUsed,
  monthlyChallengeLimit
}: {
  planId: PlanId;
  subscription?: {
    status?: string | null;
    billingInterval?: string | null;
    currentPeriodEnd?: Date | string | null;
    cancelAtPeriodEnd?: boolean | null;
    hasStripeCustomer?: boolean;
  } | null;
  dailyGenieUsed: number;
  dailyGenieLimit: number | null;
  monthlyChallengesUsed: number;
  monthlyChallengeLimit: number | null;
}) {
  const plan = getPlanById(planId);
  const nextPlan = planId === "free" ? getPlanById("starter") : planId === "starter" ? getPlanById("pro") : planId === "pro" ? getPlanById("elite") : null;
  const interval = (subscription?.billingInterval?.toLowerCase() as BillingInterval | undefined) ?? "monthly";

  return (
    <Card className="border-cyan-300/20 bg-cyan-300/8">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-100" />
              Billing status
            </CardTitle>
            <CardDescription>Your current arena access, usage, and upgrade path.</CardDescription>
          </div>
          <PlanBadge planId={plan.id} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="stat-tile rounded-md p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Plan</div>
            <div className="mt-1 text-2xl font-black text-white">{plan.displayName}</div>
          </div>
          <div className="stat-tile rounded-md p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Status</div>
            <div className="mt-1 text-2xl font-black text-white">{subscription?.status ?? "Free"}</div>
          </div>
          <div className="stat-tile rounded-md p-4">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Renewal</div>
            <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-200">
              <CalendarClock className="h-4 w-4 text-cyan-100" />
              {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : "No paid renewal"}
            </div>
          </div>
        </div>

        {subscription?.cancelAtPeriodEnd ? <Badge variant="gold">Cancels at period end</Badge> : null}

        <div className="grid gap-3 md:grid-cols-2">
          <UsageMeter label="Genie messages today" used={dailyGenieUsed} limit={dailyGenieLimit} helper="Server-enforced daily AI usage." />
          <UsageMeter label="Challenge attempts this month" used={monthlyChallengesUsed} limit={monthlyChallengeLimit} helper="Server-enforced monthly challenge access." />
        </div>

        <div className="flex flex-wrap gap-3">
          {subscription?.hasStripeCustomer ? <ManageBillingButton /> : null}
          {nextPlan && nextPlan.id !== "enterprise" && nextPlan.id !== "free" ? (
            <CheckoutButton planId={nextPlan.id} interval={interval} variant="gold">
              <Sparkles className="h-4 w-4" />
              Upgrade to {nextPlan.displayName}
            </CheckoutButton>
          ) : null}
          <Button asChild variant="secondary">
            <Link href="/pricing">Compare Plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
