import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Crown, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Pricing",
  description: "Pricing-ready plans for Gencode technical mastery."
};

const plans = [
  {
    Icon: UserRound,
    name: "Solo Operator",
    price: "Free during launch",
    description: "For learners building daily technical reps.",
    features: ["Challenge catalog access", "XP, coins, badges, streaks", "Genie mock mentor", "Immersive browser mode", "Public profile proof"]
  },
  {
    Icon: Crown,
    name: "Arena Pro",
    price: "Pricing-ready",
    description: "For interview candidates and advanced developers.",
    features: ["Structured learning paths", "Boss battle progression", "Arena sprints", "Advanced analytics", "Cosmetic rewards"]
  },
  {
    Icon: Building2,
    name: "Teams",
    price: "Contact-ready",
    description: "For bootcamps, teams, and technical training programs.",
    features: ["Private leaderboards", "Admin analytics", "Custom challenge packs", "Runner capacity planning", "Security review support"]
  }
];

export default function PricingPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <section className="text-center">
          <Badge variant="gold">
            <Sparkles className="h-3.5 w-3.5" />
            Pricing-ready foundation
          </Badge>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-none text-white sm:text-7xl">
            Start training now. Scale the arena when teams arrive.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Gencode is free for local/demo training today and architected for future paid tiers without making skill
            progression pay-to-win.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {plans.map(({ Icon, name, price, description, features }) => (
            <Card key={name} className={name === "Arena Pro" ? "border-yellow-300/25 bg-yellow-300/8" : undefined}>
              <CardHeader>
                <Icon className="h-8 w-8 text-cyan-100" />
                <CardTitle className="text-2xl">{name}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <div className="pt-3 text-2xl font-black text-white">{price}</div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm font-semibold leading-6 text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-200" />
                    {feature}
                  </div>
                ))}
                <Button asChild className="mt-3" variant={name === "Arena Pro" ? "gold" : "secondary"}>
                  <Link href={name === "Teams" ? "/about" : "/signup"}>
                    {name === "Teams" ? "Discuss team rollout" : "Start Training"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-lg border border-cyan-300/15 bg-cyan-300/8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">No pay-to-win mechanics.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                Future monetization should fund secure runners, team analytics, and premium content, not shortcut the
                learning path. Cosmetics stay cosmetic. Mastery stays earned.
              </p>
            </div>
            <ShieldCheck className="h-10 w-10 text-lime-200" />
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
