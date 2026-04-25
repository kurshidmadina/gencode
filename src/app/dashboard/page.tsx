import { getServerSession } from "next-auth";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Activity, BadgeCheck, BrainCircuit, Coins, Flame, Gauge, Radar, Route, Sparkles, Target, Trophy, WandSparkles } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { GeniePanel } from "@/components/genie/genie-panel";
import { PlanBadge } from "@/components/billing/plan-badge";
import { UsageMeter } from "@/components/billing/usage-meter";
import { ProductLoopBriefing } from "@/components/progression/product-loop-briefing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authOptions } from "@/lib/auth";
import { buildProductLoopBriefing } from "@/lib/game/product-loop";
import { getUserBillingSnapshot } from "@/lib/billing/usage";
import { getDashboardStats } from "@/lib/repositories/dashboard";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const stats = await getDashboardStats(session?.user?.id);
  const billing = await getUserBillingSnapshot(session?.user?.id);
  const productLoop = buildProductLoopBriefing(stats);

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="holo-panel rounded-lg p-6 shadow-neon">
            <Badge variant="cyan">Command center online</Badge>
            <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl">
              Welcome back, {session?.user?.username ?? "Operator"}
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Your next rank is earned one clean rep at a time. Protect the streak, attack weak skills, and keep the arena moving.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
              <div>
                <div className="mb-2 flex justify-between text-sm font-black text-slate-200">
                  <span>{formatNumber(stats.xp)} XP</span>
                  <span>{stats.levelProgress}% to next level</span>
                </div>
                <Progress value={stats.levelProgress} className="h-3" />
              </div>
              <div className="stat-tile rounded-md p-4">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-yellow-100">Current rank</div>
                <div className="mt-1 text-xl font-black text-white">{stats.rank}</div>
                <div className="mt-1 text-sm text-slate-300">Level {stats.level} / Global #{stats.leaderboardRank}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/challenges">
                  <Sparkles className="h-4 w-4" />
                  Continue Training
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/vr">
                  <WandSparkles className="h-4 w-4" />
                  Enter Immersive Mode
                </Link>
              </Button>
              <Button asChild variant="gold">
                <Link href="/pricing">Upgrade Arena</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Arena vitals</CardTitle>
              <p className="text-sm text-slate-400">Signals that decide what Genie recommends next.</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="stat-tile rounded-md p-4">
                <div className="text-slate-400">Accuracy</div>
                <div className="text-3xl font-black text-lime-100">{stats.accuracy}%</div>
              </div>
                <div className="stat-tile rounded-md p-4">
                <div className="text-slate-400">Avg attempts</div>
                <div className="text-3xl font-black text-cyan-100">{stats.averageAttempts}</div>
              </div>
                <div className="stat-tile rounded-md p-4">
                <div className="text-slate-400">Coins</div>
                <div className="text-3xl font-black text-yellow-100">{stats.coins}</div>
              </div>
                <div className="stat-tile rounded-md p-4">
                <div className="text-slate-400">Clears</div>
                <div className="text-3xl font-black text-pink-100">{stats.completed}</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-yellow-300/25 bg-yellow-300/8">
          <CardContent className="grid gap-4 p-5 lg:grid-cols-[260px_1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-yellow-100">Current access tier</div>
              <div className="mt-2 flex items-center gap-2">
                <PlanBadge planId={billing.plan.id} />
                <span className="text-sm text-slate-300">{billing.plan.upgradeMessage}</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <UsageMeter label="Genie today" used={billing.dailyUsage.genieMessagesUsed} limit={billing.entitlements.genieDailyMessageLimit} />
              <UsageMeter label="Challenges this month" used={billing.monthlyUsage.challengesAttempted} limit={billing.entitlements.monthlyChallengeLimit} />
            </div>
            <Button asChild variant="gold">
              <Link href="/settings/billing">Billing Deck</Link>
            </Button>
          </CardContent>
        </Card>

        <ProductLoopBriefing briefing={productLoop} />

        {stats.recommendedPath ? (
          <Card className="border-cyan-300/25 bg-cyan-300/8">
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">
                  <Route className="h-4 w-4" />
                  Active learning path
                </div>
                <h2 className="mt-2 text-2xl font-black text-white">{stats.recommendedPath.name}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-300">{stats.recommendedPath.description}</p>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/paths/${stats.recommendedPath.slug}`}>Open Path</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          {([
            { Icon: Gauge, label: "Level", value: stats.level },
            { Icon: Coins, label: "Coins", value: stats.coins },
            { Icon: Flame, label: "Streak", value: `${stats.streak} days` },
            { Icon: Trophy, label: "Completed", value: stats.completed }
          ] satisfies Array<{ Icon: LucideIcon; label: string; value: string | number }>).map(({ Icon, label, value }) => (
            <Card key={label} className="transition hover:border-cyan-300/30">
              <CardHeader>
                <Icon className="h-6 w-6 text-arena-glow" />
                <CardTitle className="text-sm text-slate-400">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-yellow-200" />
                  Daily Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {stats.dailyQuests.map((quest) => (
                  <div key={quest.title} className="quest-pulse grid gap-2 rounded-md border border-white/10 bg-white/6 p-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-200">
                      <span>{quest.title}</span>
                      <span>{quest.progress}/{quest.goal}</span>
                    </div>
                    <Progress value={(quest.progress / quest.goal) * 100} indicatorClassName="bg-arena-gold" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-200" />
                  Weekly Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {stats.weeklyQuests.map((quest) => (
                  <div key={quest.title} className="grid gap-2 rounded-md border border-white/10 bg-white/6 p-4">
                    <div className="flex justify-between text-sm font-semibold text-slate-200">
                      <span>{quest.title}</span>
                      <span>{Math.min(quest.progress, quest.goal)}/{quest.goal}</span>
                    </div>
                    <Progress value={(Math.min(quest.progress, quest.goal) / quest.goal) * 100} indicatorClassName="bg-arena-glow" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-200" />
                  Skill Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {stats.weakAreas.map((area, index) => (
                  <div key={area} className="rounded-md border border-white/10 bg-slate-900/70 p-4">
                    <div className="text-sm font-semibold text-slate-400">Focus {index + 1}</div>
                    <div className="mt-2 font-bold text-white">{area}</div>
                  </div>
                ))}
                {stats.strongAreas.map((area) => (
                  <div key={area} className="rounded-md border border-lime-300/20 bg-lime-300/10 p-4">
                    <div className="text-sm font-semibold text-lime-100">Strong skill</div>
                    <div className="mt-2 font-bold text-white">{area}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-5 w-5 text-cyan-200" />
                  Category Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                {stats.categoryMastery.slice(0, 8).map((category) => (
                  <div key={category.slug} className="grid gap-2 rounded-md border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-white">{category.name}</span>
                      <span className="text-sm text-cyan-100">{category.mastery}%</span>
                    </div>
                    <Progress value={category.mastery} indicatorClassName="bg-arena-glow" />
                    <div className="text-xs text-slate-400">{category.completed} clears / {category.accuracy}% accuracy</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-pink-200" />
                  Recommended Next Missions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {stats.recommended.map((challenge) => (
                  <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="grid gap-2 rounded-md border border-white/10 bg-white/6 p-4 transition hover:border-cyan-300/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{challenge.title}</span>
                      <Badge variant="cyan">{challenge.categorySlug}</Badge>
                      <Badge variant="gold">{challenge.xpReward} XP</Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-400">{challenge.subtitle}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {stats.recentSubmissions.map((submission) => (
                  <div key={submission.title} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3">
                    <span className="font-semibold text-white">{submission.title}</span>
                    <Badge variant={submission.status === "PASSED" ? "lime" : "gold"}>{submission.score}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid content-start gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-lime-200" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {stats.badges.map((badge) => (
                  <Badge key={badge} variant="lime">{badge}</Badge>
                ))}
              </CardContent>
            </Card>
            <GeniePanel mode="coach" />
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
