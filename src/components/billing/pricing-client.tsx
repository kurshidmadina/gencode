"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Crown, HelpCircle, Lock, Sparkles, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/billing-actions";
import { calculateYearlySavings, formatPlanPrice, pricingPlans, type BillingInterval } from "@/lib/billing/plans";

const comparisonRows = [
  ["Monthly challenges", "25", "150", "Unlimited standard", "Unlimited + Insane", "Per seat", "Custom"],
  ["Difficulty access", "Easy", "Easy + Medium", "Easy-Hard", "All tiers", "Easy-Hard", "Custom"],
  ["Genie mentor", "3/day", "20/day", "100/day", "High-limit", "150/day/seat", "Custom"],
  ["Learning paths", "1 active", "3 active", "Advanced", "Advanced + plans", "Assignments", "Private paths"],
  ["Boss battles", "Preview", "Limited", "Standard", "Advanced", "Team events", "Custom packs"],
  ["Arena mode", "Preview", "Limited", "Full", "Full", "Team leaderboard", "Custom"],
  ["VR / immersive", "Preview", "Locked", "Preview", "Full", "Team", "Custom"],
  ["Analytics", "Basic", "Basic", "Advanced", "Weakness diagnosis", "Team analytics", "Custom reports"]
];

export function PricingClient() {
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const publicPlans = useMemo(() => pricingPlans, []);

  return (
    <div className="grid gap-14">
      <section className="relative overflow-hidden rounded-xl border border-cyan-300/15 bg-slate-950/70 p-6 shadow-[0_0_80px_rgba(96,243,255,0.08)] sm:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(96,243,255,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,209,102,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <Badge variant="cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Startup SaaS plans
          </Badge>
          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-7xl">
            Choose your path to technical mastery.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Start free. Upgrade when the arena becomes your daily training system: deeper challenges, stronger Genie coaching,
            boss battles, immersive mode, and team analytics.
          </p>
          <div className="mt-7 inline-flex rounded-lg border border-white/10 bg-white/8 p-1">
            {(["monthly", "yearly"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setInterval(item)}
                className={`rounded-md px-5 py-2 text-sm font-black transition ${interval === item ? "bg-cyan-200 text-slate-950" : "text-slate-200 hover:bg-white/10"}`}
              >
                {item === "monthly" ? "Monthly" : "Yearly"}
                {item === "yearly" ? <span className="ml-2 text-xs">Save up to 17%</span> : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {publicPlans.map((plan) => {
          const savings = calculateYearlySavings(plan);
          const paidPlan = plan.id !== "free" && plan.id !== "enterprise";
          return (
            <Card
              key={plan.id}
              className={`relative ${plan.featured ? "border-yellow-300/40 bg-yellow-300/10 shadow-[0_0_50px_rgba(255,209,102,0.14)]" : ""}`}
            >
              {plan.badge ? (
                <div className="absolute -top-3 left-4 rounded-full border border-yellow-300/30 bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-slate-950">
                  {plan.badge}
                </div>
              ) : null}
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  {plan.id === "team" || plan.id === "enterprise" ? <Users className="h-5 w-5" /> : plan.id === "elite" ? <Crown className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-black text-white">{formatPlanPrice(plan, interval)}</span>
                  {plan.monthlyPrice !== null ? <span className="text-sm text-slate-400">/{interval === "monthly" ? "mo" : "yr"}</span> : null}
                  {interval === "yearly" && savings > 0 ? <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-lime-100">Save {savings}% yearly</div> : null}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{plan.targetAudience}</p>
                <div className="grid gap-2">
                  {plan.features.slice(0, 8).map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-200">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lime-200" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.unavailableFeatures.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-500">
                      <X className="mt-1 h-4 w-4 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                {plan.id === "free" ? (
                  <Button asChild variant="secondary">
                    <Link href="/signup">
                      {plan.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : plan.id === "enterprise" ? (
                  <Button asChild variant="secondary">
                    <Link href="/contact-sales">
                      {plan.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : paidPlan ? (
                  <CheckoutButton planId={plan.id} interval={interval} variant={plan.featured ? "gold" : "primary"} teamSeats={plan.id === "team" ? 3 : undefined}>
                    {plan.ctaLabel}
                  </CheckoutButton>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-cyan-100" />
              Help me choose
            </CardTitle>
            <CardDescription>Fast recommendations for common launch users.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Beginner building a habit", "Starter"],
              ["Interview candidate", "Pro"],
              ["Needs Insane challenges or VR", "Elite"],
              ["Bootcamp/classroom/team", "Team"],
              ["Custom packs, SSO, contracts", "Enterprise"]
            ].map(([question, answer]) => (
              <div key={question} className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/6 p-3 text-sm">
                <span className="text-slate-300">{question}</span>
                <Badge variant="gold">{answer}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Why users upgrade</CardTitle>
            <CardDescription>Pricing is built around momentum, mastery, and measurable progress.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {[
              ["Free users", "hit challenge and Genie limits after building first momentum."],
              ["Starter users", "unlock consistency, then upgrade when Hard trials and interviews matter."],
              ["Pro users", "get the core arena: paths, bosses, Arena mode, analytics, and voice."],
              ["Elite users", "unlock the Insane Realm, immersive mode, and advanced diagnosis."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-md border border-cyan-300/15 bg-cyan-300/8 p-4">
                <div className="font-black text-white">{title}</div>
                <p className="mt-1 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="overflow-x-auto rounded-lg border border-white/10 bg-slate-950/62">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-300">
              <th className="p-4">Capability</th>
              {pricingPlans.map((plan) => <th key={plan.id} className="p-4">{plan.shortName}</th>)}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row[0]} className="border-b border-white/6">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className={`p-4 ${index === 0 ? "font-black text-white" : "text-slate-300"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Can I use Gencode for free?", "Yes. Free is designed for first momentum: Easy challenges, basic XP, public profile, and limited Genie coaching."],
          ["Is checkout live without Stripe env vars?", "No. Paid buttons call secure server routes and show a setup message until Stripe keys and price IDs are configured."],
          ["Does paying skip skill progression?", "No. Paid plans unlock access and coaching, but XP, ranks, badges, and mastery still come from solving real missions."],
          ["Can teams use this now?", "Team billing, seats, and dashboards have a production-ready foundation. Full invite automation is the next expansion."],
          ["What about Enterprise?", "Enterprise uses a sales flow for private paths, custom packs, security reviews, SSO-ready architecture, and contracts."],
          ["Can prices change?", "Yes. Plan pricing and limits are centralized in config so the founder can test startup pricing without code scattered everywhere."]
        ].map(([question, answer]) => (
          <Card key={question}>
            <CardHeader>
              <CardTitle className="text-lg">{question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-300">{answer}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-xl border border-pink-300/20 bg-pink-300/10 p-7 text-center">
        <Badge variant="pink">
          <Lock className="h-3.5 w-3.5" />
          Enterprise-ready motion
        </Badge>
        <h2 className="mt-4 text-3xl font-black text-white">Training a cohort, classroom, or engineering team?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Bring Gencode to teams with seat management, progress analytics, assignment-ready paths, custom challenge packs,
          and security-review documentation.
        </p>
        <Button asChild className="mt-5" variant="gold">
          <Link href="/contact-sales">Contact Sales</Link>
        </Button>
      </section>
    </div>
  );
}
