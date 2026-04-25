import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUpgradeRecommendation } from "@/lib/billing/entitlements";
import type { FeatureGate } from "@/lib/billing/plans";
import type { Difficulty } from "@/lib/game/types";

export function UpgradePrompt({
  currentPlan,
  blockedFeature,
  difficulty,
  title = "Upgrade the arena"
}: {
  currentPlan?: string | null;
  blockedFeature: FeatureGate;
  difficulty?: Difficulty;
  title?: string;
}) {
  const recommendation = getUpgradeRecommendation(currentPlan, blockedFeature, difficulty);
  return (
    <div className="rounded-lg border border-yellow-300/25 bg-yellow-300/10 p-4 shadow-[0_0_34px_rgba(255,209,102,0.08)]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-yellow-300/25 bg-yellow-300/15 text-yellow-100">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-black text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-300">{recommendation.message}</p>
          <Button asChild size="sm" variant="gold" className="mt-3">
            <Link href={recommendation.href}>
              <Sparkles className="h-4 w-4" />
              {recommendation.cta}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
