import Link from "next/link";
import { ArrowRight, Map, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { learningPaths } from "@/lib/game/learning-paths";

export const metadata = {
  title: "Learning Paths"
};

export default function PathsPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="cyan">Structured mastery routes</Badge>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
            Choose a path. Hit milestones. Unlock the boss.
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Paths turn the catalog into a training arc: ordered missions, milestone gates, final boss battles, and visible identity rewards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/onboarding/calibration">Calibrate My Path</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/map">
                <Map className="h-4 w-4" />
                Open Academy Map
              </Link>
            </Button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {learningPaths.map((path) => (
            <Card key={path.slug} className="group transition hover:-translate-y-1 hover:border-cyan-300/35">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {path.categories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="slate">{category}</Badge>
                  ))}
                </div>
                <CardTitle className="text-2xl">{path.name}</CardTitle>
                <p className="text-sm leading-6 text-slate-400">{path.description}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="text-slate-500">Hours</div>
                    <div className="font-black text-white">{path.estimatedHours}</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="text-slate-500">Missions</div>
                    <div className="font-black text-white">{path.challengeSlugs.length}</div>
                  </div>
                  <div className="rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="text-slate-500">Badge</div>
                    <div className="font-black text-yellow-100">1</div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm">
                  <span className="flex items-center gap-2 font-bold text-yellow-50">
                    <Trophy className="h-4 w-4" />
                    {path.badgeReward}
                  </span>
                  <span className="text-yellow-100">Final boss</span>
                </div>
                <Button asChild variant="secondary" className="justify-between">
                  <Link href={`/paths/${path.slug}`}>
                    Open route
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
