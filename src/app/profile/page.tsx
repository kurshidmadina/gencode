import { getServerSession } from "next-auth";
import Link from "next/link";
import { Share2, Trophy, UserRound } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { LogoutButton } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/repositories/dashboard";

export const metadata = {
  title: "Profile"
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats(session?.user?.id);
  const username = session?.user?.username ?? session?.user?.name ?? "operator";

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Card className="holo-panel">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-cyan-300/15 text-cyan-100">
                <UserRound className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl">{username}</CardTitle>
                <p className="mt-1 text-sm text-slate-400">{stats.rank}</p>
              </div>
            </div>
            <LogoutButton />
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <div className="flex justify-between text-sm font-semibold text-slate-300">
                <span>Level {stats.level}</span>
                <span>{stats.xp} XP</span>
              </div>
              <Progress value={stats.levelProgress} className="h-3" />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Coins", stats.coins],
                ["Streak", `${stats.streak} days`],
                ["Completed", stats.completed],
                ["Global rank", `#${stats.leaderboardRank}`]
              ].map(([label, value]) => (
                <div key={label} className="stat-tile rounded-md p-3">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
                  <div className="mt-1 text-xl font-black text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.badges.map((badge) => (
                <Badge key={badge} variant="lime">{badge}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-300/20 bg-cyan-300/8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Share2 className="h-5 w-5 text-cyan-100" />
              Public proof card
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Identity</div>
                <div className="mt-1 font-black text-white">{stats.rank}</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Momentum</div>
                <div className="mt-1 font-black text-lime-100">{stats.streak}-day streak</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Proof</div>
                <div className="mt-1 font-black text-yellow-100">{stats.completed} clears</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={`/profile/${encodeURIComponent(username)}`}>
                  View public profile
                </Link>
              </Button>
              <Button asChild variant="gold">
                <Link href="/challenges">
                  <Trophy className="h-4 w-4" />
                  Earn next badge
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
