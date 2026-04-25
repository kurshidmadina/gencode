import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Lock, Swords } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { BossProgressPanel } from "@/components/boss-battles/boss-progress-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBossBattle } from "@/lib/game/boss-battles";

export const metadata = {
  title: "Boss Battle"
};

export default async function BossBattleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boss = getBossBattle(slug);
  if (!boss) notFound();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold">Boss battle</Badge>
            <Badge variant="slate">{boss.categorySlug}</Badge>
            <Badge variant="cyan">{boss.difficulty}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">{boss.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{boss.story}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={boss.stages[0]?.challengeSlug ? `/challenges/${boss.stages[0].challengeSlug}` : "/challenges"}>
                Start first stage
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/arena">Warm up in Arena</Link>
            </Button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["XP", boss.xpReward],
            ["Coins", boss.coinReward],
            ["Minutes", boss.estimatedTime],
            ["Required clears", boss.unlockRules.requiredCompletions]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle className="text-sm text-slate-400">{label}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-black text-white">{value}</CardContent>
            </Card>
          ))}
        </section>
        <BossProgressPanel bossSlug={boss.slug} stages={boss.stages.map((stage) => ({ title: stage.title }))} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-pink-200" />
              Battle stages
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {boss.stages.map((stage, index) => (
              <div key={stage.title} className="grid gap-3 rounded-md border border-white/10 bg-white/6 p-4 lg:grid-cols-[80px_1fr_260px] lg:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-black/25 text-xl font-black text-white">{index + 1}</div>
                <div>
                  <div className="font-black text-white">{stage.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{stage.instructions}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stage.validation.requiredSignals.map((signal) => (
                      <Badge key={signal} variant="slate">{signal}</Badge>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-lime-200" />
                    {stage.validation.scoring}
                  </div>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={stage.challengeSlug ? `/challenges/${stage.challengeSlug}` : "/challenges"}>Open linked mission</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="rounded-md border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
          <div className="flex items-center gap-2 font-black">
            <Lock className="h-4 w-4" />
            Gate design
          </div>
          Boss access is designed to require {boss.unlockRules.requiredCompletions} clears across {boss.unlockRules.categories.join(", ")}.
          The current local build shows the gate and linked stages; full timed boss persistence is stored through the BossBattle schema.
        </div>
      </main>
    </AppFrame>
  );
}
