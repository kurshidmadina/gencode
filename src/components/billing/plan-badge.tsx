import { Crown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlanById } from "@/lib/billing/plans";

const variantByPlan = {
  free: "slate",
  starter: "cyan",
  pro: "gold",
  elite: "pink",
  team: "lime",
  enterprise: "violet"
} as const;

export function PlanBadge({ planId }: { planId?: string | null }) {
  const plan = getPlanById(planId);
  return (
    <Badge variant={variantByPlan[plan.id]}>
      {plan.id === "elite" || plan.id === "enterprise" ? <Crown className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
      {plan.displayName}
    </Badge>
  );
}
