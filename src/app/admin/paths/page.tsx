import Link from "next/link";
import { Route, ShieldCheck } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { canReachDatabase } from "@/lib/db-health";
import { learningPaths } from "@/lib/game/learning-paths";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Learning Paths"
};

async function getPaths() {
  if (!(await canReachDatabase())) {
    return learningPaths.map((path) => ({
      slug: path.slug,
      name: path.name,
      description: path.description,
      targetAudience: path.targetAudience,
      estimatedHours: path.estimatedHours,
      badgeReward: path.badgeReward,
      finalBossSlug: path.finalBossSlug,
      challengeCount: path.challengeSlugs.length,
      activeLearners: 0,
      completionRate: 0
    }));
  }

  try {
    const paths = await prisma.learningPath.findMany({
      orderBy: { estimatedHours: "asc" },
      include: {
        _count: { select: { challenges: true, progress: true } },
        progress: { select: { completedAt: true } }
      }
    });
    if (paths.length > 0) {
      return paths.map((path) => {
        const completed = path.progress.filter((item) => item.completedAt).length;
        return {
          slug: path.slug,
          name: path.name,
          description: path.description,
          targetAudience: path.targetAudience,
          estimatedHours: path.estimatedHours,
          badgeReward: path.badgeReward,
          finalBossSlug: path.finalBossSlug,
          challengeCount: path._count.challenges,
          activeLearners: path._count.progress,
          completionRate: path._count.progress ? Math.round((completed / path._count.progress) * 100) : 0
        };
      });
    }
  } catch {
    // Static fallback below keeps admin useful before Postgres is available.
  }

  return learningPaths.map((path) => ({
    slug: path.slug,
    name: path.name,
    description: path.description,
    targetAudience: path.targetAudience,
    estimatedHours: path.estimatedHours,
    badgeReward: path.badgeReward,
    finalBossSlug: path.finalBossSlug,
    challengeCount: path.challengeSlugs.length,
    activeLearners: 0,
    completionRate: 0
  }));
}

export default async function AdminPathsPage() {
  await requireAdmin();
  const paths = await getPaths();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="cyan">
            <Route className="h-3.5 w-3.5" />
            Curriculum control
          </Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Learning Path Operations</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Audit path sequencing, boss gates, learner activity, and badge rewards before promoting curriculum changes.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {paths.map((path) => (
            <Card key={path.slug}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>{path.name}</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{path.description}</p>
                  </div>
                  <Badge variant={path.completionRate > 50 ? "lime" : "slate"}>{path.completionRate}% complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 text-sm sm:grid-cols-4">
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{path.challengeCount}</div><div className="text-slate-500">missions</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{path.estimatedHours}h</div><div className="text-slate-500">estimate</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{path.activeLearners}</div><div className="text-slate-500">learners</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{path.badgeReward}</div><div className="text-slate-500">badge</div></div>
                </div>
                <Progress value={path.completionRate} />
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>Audience: {path.targetAudience}</span>
                  <Link href={`/paths/${path.slug}`} className="font-black text-cyan-100 hover:text-cyan-50">Inspect learner view</Link>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/6 p-3 text-sm text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-lime-200" />
                  Final boss gate: {path.finalBossSlug ?? "not assigned"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppFrame>
  );
}
