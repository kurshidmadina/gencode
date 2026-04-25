import { Crown, Flame, Share2, Target } from "lucide-react";
import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeaderboard } from "@/lib/repositories/dashboard";
import { categories, difficulties } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Leaderboard"
};

type PageProps = {
  searchParams: Promise<{ scope?: string; category?: string; difficulty?: string }>;
};

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const scope = params.scope ?? "global";
  const leaderboard = await getLeaderboard(scope, params.category, params.difficulty);
  const scopes = ["global", "weekly", "monthly"];

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="gold">{scope} ladder</Badge>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Leaderboards</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            This is not just an XP pile. Gencode ranks consistency, hard clears, no-hint discipline, and late-game courage so users can chase identity, not vanity points.
          </p>
        </div>
        <section className="grid gap-3 md:grid-cols-3">
          {[
            [Flame, "Return reason", "Weekly ladders reset the race without erasing lifetime identity."],
            [Target, "Fair pressure", "Category and difficulty filters let beginners compete in the right room."],
            [Share2, "Profile proof", "Every operator links to a public profile built for showing real technical momentum."]
          ].map(([Icon, title, copy]) => (
            <Card key={title as string} className="bg-white/6">
              <CardHeader>
                <Icon className="h-6 w-6 text-cyan-100" />
                <CardTitle>{title as string}</CardTitle>
                <p className="text-sm leading-6 text-slate-400">{copy as string}</p>
              </CardHeader>
            </Card>
          ))}
        </section>
        <div className="flex flex-wrap gap-2">
          {scopes.map((item) => (
            <Link key={item} href={`/leaderboard?scope=${item}`} className={`rounded-md px-3 py-2 text-sm font-bold ${scope === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 bg-white/8 text-slate-200"}`}>
              {item.toUpperCase()}
            </Link>
          ))}
          {difficulties.map((difficulty) => (
            <Link key={difficulty} href={`/leaderboard?scope=${scope}&difficulty=${difficulty}`} className={`rounded-md px-3 py-2 text-sm font-bold ${params.difficulty === difficulty ? "bg-yellow-300 text-slate-950" : "border border-white/10 bg-white/8 text-slate-200"}`}>
              {difficulty}
            </Link>
          ))}
          {categories.slice(0, 8).map((category) => (
            <Link key={category.slug} href={`/leaderboard?scope=${scope}&category=${category.slug}`} className={`rounded-md px-3 py-2 text-sm font-bold ${params.category === category.slug ? "bg-lime-300 text-slate-950" : "border border-white/10 bg-white/8 text-slate-200"}`}>
              {category.name}
            </Link>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-200" />
              Top Operators
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {leaderboard.map((player) => (
              <div key={player.username} className={`grid items-center gap-3 rounded-md border p-4 lg:grid-cols-[80px_1fr_repeat(6,minmax(82px,1fr))] ${player.rank <= 3 ? "border-yellow-300/25 bg-yellow-300/8" : "border-white/10 bg-white/6"}`}>
                <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-black/25 text-2xl font-black text-white">#{player.rank}</div>
                <Link href={`/profile/${encodeURIComponent(player.username)}`} className="font-bold text-cyan-50 transition hover:text-cyan-200">
                  {player.username}
                </Link>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-slate-300">{formatNumber(player.xp)} XP</div>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-slate-300">{player.completed} clears</div>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-slate-300">{player.streak} streak</div>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-slate-300">{player.hardCompletions} hard</div>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-lime-100">{player.noHintCompletions ?? 0} no hint</div>
                <div className="stat-tile rounded-md px-3 py-2 text-sm text-yellow-100">{player.insaneCompletions} insane</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
