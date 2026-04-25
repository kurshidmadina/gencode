import { AlertTriangle, BarChart3, Bot, BrainCircuit, Cuboid, ShieldCheck, Swords, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Analytics"
};

async function getAnalytics() {
  if (!(await canReachDatabase())) {
    return {
      completionRate: 0,
      failedChallenges: [],
      categories: [],
      aiMessages: 0,
      vrSessions: 0,
      arenaRuns: 0,
      bossStageAttempts: 0,
      topArenaRuns: [],
      auditLogs: []
    };
  }

  const [submissions, passed, failedGroups, categoryGroups, aiMessages, vrSessions, arenaRuns, bossStageAttempts, topArenaRuns, auditLogs] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "PASSED" } }),
    prisma.submission.groupBy({
      by: ["challengeId"],
      where: { status: "FAILED" },
      _count: { _all: true },
      orderBy: { _count: { challengeId: "desc" } },
      take: 8
    }),
    prisma.challenge.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
      orderBy: { _count: { categoryId: "desc" } }
    }),
    prisma.chatMessage.count({ where: { role: "ASSISTANT" } }),
    prisma.vRSession.count(),
    prisma.arenaRun.count(),
    prisma.bossBattleStageAttempt.count(),
    prisma.arenaRun.findMany({
      orderBy: [{ score: "desc" }, { startedAt: "desc" }],
      take: 5,
      include: { user: true }
    }),
    prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: true } })
  ]);

  const [failedChallenges, categories] = await Promise.all([
    Promise.all(
      failedGroups.map(async (group) => {
        const challenge = await prisma.challenge.findUnique({ where: { id: group.challengeId }, include: { category: true } });
        return { title: challenge?.title ?? "Unknown", category: challenge?.category.slug ?? "unknown", failures: group._count._all };
      })
    ),
    Promise.all(
      categoryGroups.map(async (group) => {
        const category = await prisma.category.findUnique({ where: { id: group.categoryId } });
        return { name: category?.name ?? "Unknown", count: group._count._all };
      })
    )
  ]);

  return {
    completionRate: submissions ? Math.round((passed / submissions) * 100) : 0,
    failedChallenges,
    categories,
    aiMessages,
    vrSessions,
    arenaRuns,
    bossStageAttempts,
    topArenaRuns,
    auditLogs
  };
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const analytics = await getAnalytics();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="gold">Platform intelligence</Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Admin Analytics</h1>
          <p className="mt-2 text-slate-400">Completion health, failure hotspots, content coverage, Genie usage, VR sessions, and audit trail.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card><CardHeader><BarChart3 className="h-6 w-6 text-arena-glow" /><CardTitle className="text-sm text-slate-400">Completion</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.completionRate}%</div></CardContent></Card>
          <Card><CardHeader><AlertTriangle className="h-6 w-6 text-yellow-200" /><CardTitle className="text-sm text-slate-400">Failure hotspots</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.failedChallenges.length}</div></CardContent></Card>
          <Card><CardHeader><Bot className="h-6 w-6 text-cyan-200" /><CardTitle className="text-sm text-slate-400">Genie replies</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.aiMessages}</div></CardContent></Card>
          <Card><CardHeader><Cuboid className="h-6 w-6 text-lime-200" /><CardTitle className="text-sm text-slate-400">VR sessions</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.vrSessions}</div></CardContent></Card>
          <Card><CardHeader><Trophy className="h-6 w-6 text-yellow-200" /><CardTitle className="text-sm text-slate-400">Arena runs</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.arenaRuns}</div></CardContent></Card>
          <Card><CardHeader><Swords className="h-6 w-6 text-pink-200" /><CardTitle className="text-sm text-slate-400">Boss stages</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-white">{analytics.bossStageAttempts}</div></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-200" />Failed Challenge Hotspots</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {analytics.failedChallenges.length === 0 ? <p className="text-sm text-slate-400">No failures recorded yet.</p> : analytics.failedChallenges.map((item) => (
                <div key={item.title} className="rounded-md border border-white/10 bg-white/6 p-3">
                  <div className="flex justify-between gap-3 text-sm font-bold text-white"><span>{item.title}</span><span>{item.failures} fails</span></div>
                  <div className="mt-1 text-xs text-slate-400">{item.category}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-cyan-200" />Category Coverage</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {analytics.categories.slice(0, 10).map((item) => (
                <div key={item.name} className="grid gap-2">
                  <div className="flex justify-between text-sm font-semibold text-slate-300"><span>{item.name}</span><span>{item.count} missions</span></div>
                  <Progress value={Math.min(100, (item.count / 25) * 100)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-200" />Arena Leader Signals</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {analytics.topArenaRuns.length === 0 ? <p className="text-sm text-slate-400">No arena runs recorded yet.</p> : analytics.topArenaRuns.map((run) => (
              <div key={run.id} className="grid gap-2 rounded-md border border-white/10 bg-white/6 p-3 md:grid-cols-[1fr_140px_140px_180px] md:items-center">
                <span className="font-bold text-white">{run.user?.username ?? "anonymous"} / {run.modeSlug}</span>
                <span className="text-sm text-cyan-100">{run.score} score</span>
                <span className="text-sm text-lime-100">{run.accuracy}% accuracy</span>
                <span className="text-sm text-slate-400">{run.startedAt.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-lime-200" />Admin Audit Trail</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {analytics.auditLogs.length === 0 ? <p className="text-sm text-slate-400">No admin mutations recorded yet.</p> : analytics.auditLogs.map((log) => (
              <div key={log.id} className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3 md:grid-cols-[180px_1fr_220px]">
                <span className="font-bold text-cyan-100">{log.action}</span>
                <span className="text-sm text-slate-300">{log.target} {log.targetId ?? ""}</span>
                <span className="text-sm text-slate-400">{log.actor?.username ?? "system"} / {log.createdAt.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
