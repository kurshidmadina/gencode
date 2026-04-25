import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { bossBattles } from "@/lib/game/boss-battles";
import { getLearningPath, getLearningPathChallenges } from "@/lib/game/learning-paths";

export const metadata = {
  title: "Learning Path"
};

export default async function PathDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = getLearningPath(slug);
  if (!path) notFound();
  const challenges = getLearningPathChallenges(path);
  const boss = bossBattles.find((battle) => battle.slug === path.finalBossSlug);

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="holo-panel rounded-lg p-7 shadow-neon">
            <div className="flex flex-wrap gap-2">
              <Badge variant="cyan">Learning path</Badge>
              {path.categories.map((category) => (
                <Badge key={category} variant="slate">{category}</Badge>
              ))}
            </div>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">{path.name}</h1>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">{path.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`/challenges/${path.challengeSlugs[0]}`}>
                  Start path
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={boss ? `/boss-battles/${boss.slug}` : "/boss-battles"}>View boss gate</Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Path reward</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid h-24 place-items-center rounded-md border border-yellow-300/25 bg-yellow-300/10 text-center">
                <div>
                  <Trophy className="mx-auto h-7 w-7 text-yellow-200" />
                  <div className="mt-2 font-black text-white">{path.badgeReward}</div>
                </div>
              </div>
              <div className="text-sm leading-6 text-slate-400">{path.targetAudience}</div>
              <Progress value={12} indicatorClassName="bg-arena-gold" />
              <div className="text-xs text-slate-500">Demo progress: start the first mission to begin tracking.</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {path.milestones.map((milestone) => (
            <Card key={milestone.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-lime-200" />
                  {milestone.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-400">
                {milestone.description} Required clears: {milestone.requiredClears}.
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Mission chain</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {challenges.map((challenge, index) => (
              <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="grid gap-3 rounded-md border border-white/10 bg-white/6 p-4 transition hover:border-cyan-300/40 md:grid-cols-[80px_1fr_120px_100px] md:items-center">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</div>
                <div>
                  <div className="font-black text-white">{challenge.title}</div>
                  <div className="text-sm text-slate-400">{challenge.subtitle}</div>
                </div>
                <Badge variant="gold">{challenge.difficulty}</Badge>
                <Badge variant="cyan">{challenge.xpReward} XP</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
