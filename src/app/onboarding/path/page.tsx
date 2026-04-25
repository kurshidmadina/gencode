import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, CalendarClock, Flame, Route, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLearningPath, getLearningPathChallenges } from "@/lib/game/learning-paths";

export const metadata = {
  title: "Recommended Path"
};

export default async function RecommendedPathPage({ searchParams }: { searchParams: Promise<{ path?: string }> }) {
  const params = await searchParams;
  const path = getLearningPath(params.path ?? "backend-api") ?? getLearningPath("backend-api")!;
  const challenges = getLearningPathChallenges(path);
  const firstChallenge = challenges[0];

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="lime">Recommended route</Badge>
          <h1 className="mt-4 text-4xl font-black text-white">{path.name}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{path.description}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/paths/${path.slug}`}>
                Open Full Path
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="gold">
              <Link href={firstChallenge ? `/challenges/${firstChallenge.slug}` : "/challenges?difficulty=EASY"}>
                Start Guided First Mission
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card className="border-cyan-300/25 bg-cyan-300/8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarClock className="h-5 w-5 text-cyan-100" />
                Your first 10 minutes
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                ["0-2", "Read the path promise", `You are training for: ${path.targetAudience}`],
                ["2-7", "Clear the first room", firstChallenge ? `${firstChallenge.title} teaches the first mechanic without flooding you.` : "Choose an Easy starter mission."],
                ["7-9", "Ask Genie for review", "Use hint or mentor mode to understand the edge case, not memorize an answer."],
                ["9-10", "Queue tomorrow", "Your dashboard will turn this into a streak, quest, and next-mission cue."]
              ].map(([minute, title, copy]) => (
                <div key={minute} className="rounded-md border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">{minute} min</div>
                  <div className="mt-1 font-black text-white">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-yellow-300/20 bg-yellow-300/8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-200" />
                What this unlocks
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-yellow-50">
              <div className="rounded-md border border-yellow-300/20 bg-black/20 p-3">
                <Flame className="mb-2 h-4 w-4" />
                Daily quest progress and streak momentum.
              </div>
              <div className="rounded-md border border-yellow-300/20 bg-black/20 p-3">
                <BrainCircuit className="mb-2 h-4 w-4" />
                Better Genie context for hints and interviews.
              </div>
              <div className="rounded-md border border-yellow-300/20 bg-black/20 p-3">
                <BadgeCheck className="mb-2 h-4 w-4" />
                Badge progress toward {path.badgeReward}.
              </div>
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
                {milestone.description} Clear {milestone.requiredClears} missions to lock it in.
              </CardContent>
            </Card>
          ))}
        </section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-cyan-200" />
              First mission chain
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {challenges.slice(0, 6).map((challenge, index) => (
              <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/6 p-4 transition hover:border-cyan-300/40">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Step {index + 1}</div>
                  <div className="font-black text-white">{challenge.title}</div>
                </div>
                <Badge variant="gold">{challenge.xpReward} XP</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
