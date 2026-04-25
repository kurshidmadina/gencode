import Link from "next/link";
import { ArrowRight, Award, BarChart3, Flame, Share2, Target, Trophy, UserRound } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { canReachDatabase } from "@/lib/db-health";
import { getLevelForXp, getRankName } from "@/lib/game/progression";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  return { title: `${username} Profile` };
}

async function getPublicProfile(username: string) {
  if (!(await canReachDatabase())) return null;
  try {
    return prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        badges: { include: { badge: true }, take: 12 },
        categoryProgress: { include: { category: true }, orderBy: { xp: "desc" }, take: 8 },
        achievements: { include: { achievement: true }, orderBy: { unlockedAt: "desc" }, take: 6 },
        submissions: {
          include: { challenge: { include: { category: true } } },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        progress: { where: { status: "COMPLETED" }, take: 1 },
        _count: {
          select: {
            progress: { where: { status: "COMPLETED" } },
            submissions: true
          }
        }
      }
    });
  } catch {
    return null;
  }
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const user = await getPublicProfile(username);
  const level = getLevelForXp(user?.xp ?? 0);
  const completedCount = user?._count.progress ?? 0;
  const attempts = user?._count.submissions ?? 0;
  const categoryRows = user?.categoryProgress ?? [];
  const strongest = categoryRows[0];
  const weakest = categoryRows.at(-1);
  const recommendations = (weakest
    ? [
        `Train ${weakest.category.name} next to balance the skill graph.`,
        `Push ${weakest.category.name} accuracy above ${Math.min(95, weakest.accuracy + 10)}%.`,
        "Complete one no-hint mission to unlock cleaner mastery signals."
      ]
    : [
        "Complete the first mission to unlock personalized recommendations.",
        "Start with Linux, SQL, or Python to build broad technical momentum.",
        "Use Genie in hint mode before asking for full solutions."
      ]);

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Card className="holo-panel">
          <CardHeader>
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-cyan-300/15 text-cyan-100">
              <UserRound className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl">@{user?.username ?? username}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="leading-7 text-slate-400">{user?.profile?.bio ?? "Public Gencode profile with rank, badges, streaks, and skill graph."}</p>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="stat-tile rounded-md p-3"><div className="text-sm text-slate-400">Rank</div><div className="font-black text-white">{getRankName(level.level)}</div></div>
              <div className="stat-tile rounded-md p-3"><div className="text-sm text-slate-400">Level</div><div className="font-black text-white">{level.level}</div></div>
              <div className="stat-tile rounded-md p-3"><div className="text-sm text-slate-400">XP</div><div className="font-black text-white">{user?.xp ?? 0}</div></div>
              <div className="stat-tile rounded-md p-3"><div className="text-sm text-slate-400">Streak</div><div className="font-black text-white">{user?.streak ?? 0}</div></div>
            </div>
            <Progress value={level.progressPercent} className="h-3" />
            <div className="flex flex-wrap gap-2">
              {(user?.badges.length ? user.badges.map((item) => item.badge.name) : ["First Blood", "Terminal Rookie", "7-Day Streak"]).map((badge) => (
                <Badge key={badge} variant="lime">{badge}</Badge>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="stat-tile rounded-md p-3">
                <div className="text-sm text-slate-400">Completed challenges</div>
                <div className="text-2xl font-black text-white">{completedCount}</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-sm text-slate-400">Accuracy signal</div>
                <div className="text-2xl font-black text-white">{strongest?.accuracy ?? 0}%</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-sm text-slate-400">Average attempts</div>
                <div className="text-2xl font-black text-white">{attempts && completedCount ? (attempts / completedCount).toFixed(1) : "0.0"}</div>
              </div>
            </div>
            </CardContent>
        </Card>

        <Card className="overflow-hidden border-yellow-300/20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,209,102,0.18),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(96,243,255,0.15),transparent_28%),rgba(2,6,23,0.72)]">
          <CardHeader>
            <Badge variant="gold">
              <Share2 className="h-3.5 w-3.5" />
              Shareable operator signal
            </Badge>
            <CardTitle className="text-2xl">Proof that training is turning into identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            {[
              ["Rank", getRankName(level.level)],
              ["Streak", `${user?.streak ?? 0} days`],
              ["Clears", completedCount],
              ["Best skill", strongest?.category.name ?? "Warming up"]
            ].map(([label, value]) => (
              <div key={label} className="stat-tile rounded-md p-4">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</div>
                <div className="mt-2 font-black text-white">{value}</div>
              </div>
            ))}
            <div className="md:col-span-4 rounded-md border border-lime-300/20 bg-lime-300/10 p-4 text-sm leading-6 text-lime-50">
              <Flame className="mb-2 h-4 w-4" />
              This profile is designed to show consistency, breadth, and technical momentum instead of a single solved-problem count.
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-cyan-300/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-cyan-200" />
                Category mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {categoryRows.length ? categoryRows.map((item) => (
                <div key={item.id} className="grid gap-2 stat-tile rounded-md p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-200">
                    <span>{item.category.name}</span>
                    <span>{item.completedChallenges} clears - {item.accuracy}% accuracy</span>
                  </div>
                  <Progress value={Math.min(100, (item.completedChallenges / 25) * 100)} />
                </div>
              )) : (
                <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-400">
                  No mastery data yet. Complete a mission and the skill graph will start lighting up.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-lime-300/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-lime-200" />
                Learning recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Strongest area</div>
                <div className="mt-1 font-black text-white">{strongest?.category.name ?? "Not established"}</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Weakest area</div>
                <div className="mt-1 font-black text-white">{weakest?.category.name ?? "Not established"}</div>
              </div>
              {recommendations.map((item) => (
                <div key={item} className="rounded-md border border-cyan-300/15 bg-cyan-300/8 p-3 text-sm text-cyan-50">
                  {item}
                </div>
              ))}
              <Link href="/challenges" className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200">
                Continue training
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-amber-200" />
                Recent achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {user?.achievements.length ? user.achievements.map((item) => (
                <div key={item.id} className="stat-tile rounded-md p-3">
                  <div className="font-black text-white">{item.achievement.name}</div>
                  <div className="text-sm text-slate-400">{item.achievement.description}</div>
                </div>
              )) : (
                <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-400">
                  Achievements appear here after completed missions.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-5 w-5 text-violet-200" />
                Recent mission history
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {user?.submissions.length ? user.submissions.map((item) => (
                <Link key={item.id} href={`/challenges/${item.challenge.slug}`} className="stat-tile rounded-md p-3 transition hover:border-cyan-300/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-black text-white">{item.challenge.title}</div>
                      <div className="text-sm text-slate-400">{item.challenge.category.name} - {item.challenge.difficulty}</div>
                    </div>
                    <Badge variant={item.status === "PASSED" ? "lime" : "red"}>{item.status}</Badge>
                  </div>
                </Link>
              )) : (
                <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-400">
                  Mission attempts will appear here once training starts.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </AppFrame>
  );
}
