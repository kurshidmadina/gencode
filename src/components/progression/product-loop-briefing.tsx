import Link from "next/link";
import { ArrowRight, CalendarClock, Flame, Sparkles, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductLoopBriefing as ProductLoopBriefingData } from "@/lib/game/product-loop";

const toneClasses: Record<ProductLoopBriefingData["signals"][number]["tone"], string> = {
  cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-50",
  gold: "border-yellow-300/20 bg-yellow-300/10 text-yellow-50",
  lime: "border-lime-300/20 bg-lime-300/10 text-lime-50",
  pink: "border-pink-300/20 bg-pink-300/10 text-pink-50"
};

export function ProductLoopBriefing({ briefing }: { briefing: ProductLoopBriefingData }) {
  return (
    <Card className="overflow-hidden border-cyan-300/25 bg-[radial-gradient(circle_at_12%_12%,rgba(96,243,255,0.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(255,79,216,0.13),transparent_26%),rgba(2,6,23,0.72)]">
      <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_390px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={briefing.segment === "late-game" ? "pink" : briefing.segment === "first-session" ? "cyan" : "lime"}>
              {briefing.segment === "first-session" ? "First-session flight plan" : briefing.segment === "late-game" ? "Late-game pressure" : "Return loop"}
            </Badge>
            {briefing.nextChallenge ? <Badge variant="gold">{briefing.nextChallenge.xpReward} XP queued</Badge> : null}
          </div>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-white">{briefing.headline}</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{briefing.subcopy}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={briefing.primaryCta.href}>
                <Sparkles className="h-4 w-4" />
                {briefing.primaryCta.label}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={briefing.secondaryCta.href}>
                {briefing.secondaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {briefing.signals.map((signal) => (
              <div key={signal.label} className={`rounded-md border p-4 ${toneClasses[signal.tone]}`}>
                <div className="text-xs font-black uppercase tracking-[0.22em] opacity-75">{signal.label}</div>
                <div className="mt-2 text-sm font-semibold leading-6">{signal.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/25 p-4">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-cyan-100">
            <CalendarClock className="h-4 w-4" />
            First 10 minutes
          </div>
          <div className="grid gap-3">
            {briefing.firstTenMinutePlan.map((step, index) => (
              <Link key={`${step.minute}-${step.title}`} href={step.href} className="group grid gap-2 rounded-md border border-white/10 bg-white/6 p-3 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-cyan-300/15 text-xs font-black text-cyan-100">{index + 1}</span>
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{step.minute} min</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-100" />
                </div>
                <div className="font-black text-white">{step.title}</div>
                <p className="text-sm leading-6 text-slate-400">{step.copy}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-lime-300/15 bg-lime-300/8 p-3 text-sm text-lime-50">
              <Flame className="mb-2 h-4 w-4" />
              Return tomorrow with a preloaded next action.
            </div>
            <div className="rounded-md border border-yellow-300/15 bg-yellow-300/8 p-3 text-sm text-yellow-50">
              <Trophy className="mb-2 h-4 w-4" />
              Every clear compounds profile identity.
            </div>
          </div>
          <div className="mt-3 rounded-md border border-pink-300/15 bg-pink-300/8 p-3 text-sm leading-6 text-pink-50">
            <Target className="mb-2 h-4 w-4" />
            Genie should always leave you with one concrete next rep, not just an explanation.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
