import Link from "next/link";
import { ArrowRight, Swords, Timer, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bossBattles } from "@/lib/game/boss-battles";

export const metadata = {
  title: "Boss Battles"
};

export default function BossBattlesPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="gold">Multi-stage arena fights</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Boss battles prove your skills survive pressure.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Normal missions teach the move. Bosses test the system: multiple stages, story pressure, scoring rubrics, bigger rewards, and profile-worthy badges.
          </p>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bossBattles.map((boss) => (
            <Card key={boss.slug} className="group transition hover:-translate-y-1 hover:border-yellow-300/35">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{boss.difficulty}</Badge>
                  <Badge variant="slate">{boss.categorySlug}</Badge>
                  <Badge variant="cyan">{boss.stages.length} stages</Badge>
                </div>
                <CardTitle className="text-2xl">{boss.name}</CardTitle>
                <p className="text-sm leading-6 text-slate-400">{boss.description}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <Swords className="mb-2 h-4 w-4 text-pink-200" />
                    <div className="font-black text-white">{boss.xpReward} XP</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <Trophy className="mb-2 h-4 w-4 text-yellow-200" />
                    <div className="font-black text-white">{boss.coinReward}</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <Timer className="mb-2 h-4 w-4 text-cyan-200" />
                    <div className="font-black text-white">{boss.estimatedTime}m</div>
                  </div>
                </div>
                <div className="rounded-md border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm font-bold text-yellow-50">
                  Reward badge: {boss.badgeReward}
                </div>
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={`/boss-battles/${boss.slug}`}>
                    Open boss
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </AppFrame>
  );
}
