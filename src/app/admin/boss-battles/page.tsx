import Link from "next/link";
import { Flame, Swords } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canReachDatabase } from "@/lib/db-health";
import { bossBattles } from "@/lib/game/boss-battles";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Boss Battles"
};

async function getBosses() {
  if (!(await canReachDatabase())) {
    return bossBattles.map((boss) => ({
      slug: boss.slug,
      name: boss.name,
      description: boss.description,
      difficulty: boss.difficulty,
      categorySlug: boss.categorySlug,
      xpReward: boss.xpReward,
      coinReward: boss.coinReward,
      stageCount: boss.stages.length,
      attempts: 0,
      clears: 0,
      active: true
    }));
  }

  try {
    const bosses = await prisma.bossBattle.findMany({
      orderBy: [{ difficulty: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { stages: true, progress: true, stageAttempts: true } },
        progress: { select: { status: true } }
      }
    });
    if (bosses.length > 0) {
      return bosses.map((boss) => ({
        slug: boss.slug,
        name: boss.name,
        description: boss.description,
        difficulty: boss.difficulty,
        categorySlug: boss.categorySlug,
        xpReward: boss.xpReward,
        coinReward: boss.coinReward,
        stageCount: boss._count.stages,
        attempts: boss._count.stageAttempts,
        clears: boss.progress.filter((item) => item.status === "COMPLETED").length,
        active: boss.active
      }));
    }
  } catch {
    // Static fallback below.
  }

  return bossBattles.map((boss) => ({
    slug: boss.slug,
    name: boss.name,
    description: boss.description,
    difficulty: boss.difficulty,
    categorySlug: boss.categorySlug,
    xpReward: boss.xpReward,
    coinReward: boss.coinReward,
    stageCount: boss.stages.length,
    attempts: 0,
    clears: 0,
    active: true
  }));
}

export default async function AdminBossBattlesPage() {
  await requireAdmin();
  const bosses = await getBosses();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="pink">
            <Swords className="h-3.5 w-3.5" />
            Boss encounter balance
          </Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Boss Battle Operations</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Review late-game encounters, reward pressure, stage count, attempts, and completion signals.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {bosses.map((boss) => (
            <Card key={boss.slug}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle>{boss.name}</CardTitle>
                  <Badge variant={boss.active ? "lime" : "slate"}>{boss.active ? "active" : "hidden"}</Badge>
                </div>
                <p className="text-sm leading-6 text-slate-400">{boss.description}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 text-sm sm:grid-cols-5">
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{boss.difficulty}</div><div className="text-slate-500">tier</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{boss.stageCount}</div><div className="text-slate-500">stages</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{boss.attempts}</div><div className="text-slate-500">attempts</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{boss.clears}</div><div className="text-slate-500">clears</div></div>
                  <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{boss.xpReward}</div><div className="text-slate-500">XP</div></div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>{boss.categorySlug} / {boss.coinReward} coins</span>
                  <Link href={`/boss-battles/${boss.slug}`} className="font-black text-cyan-100 hover:text-cyan-50">Open boss room</Link>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-pink-300/15 bg-pink-300/8 p-3 text-sm text-pink-50">
                  <Flame className="h-4 w-4" />
                  Balance watch: late-game bosses should feel difficult, explainable, and fair.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </AppFrame>
  );
}
