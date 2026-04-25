import { CheckCircle2, Target } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { canReachDatabase } from "@/lib/db-health";
import { platformQuests } from "@/lib/game/platform-quests";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Quests"
};

async function getQuests() {
  if (!(await canReachDatabase())) {
    return platformQuests.map((quest) => ({
      slug: quest.slug,
      title: quest.title,
      description: quest.description,
      type: quest.type,
      cadence: quest.cadence ?? "MILESTONE",
      xpReward: quest.xpReward,
      coinReward: quest.coinReward,
      active: true,
      assigned: 0,
      completed: 0
    }));
  }

  try {
    const quests = await prisma.quest.findMany({
      orderBy: [{ type: "asc" }, { title: "asc" }],
      include: {
        _count: { select: { users: true } },
        users: { select: { completedAt: true } }
      }
    });
    if (quests.length > 0) {
      return quests.map((quest) => ({
        slug: quest.slug,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        cadence: quest.cadence ?? "MILESTONE",
        xpReward: quest.xpReward,
        coinReward: quest.coinReward,
        active: quest.active,
        assigned: quest._count.users,
        completed: quest.users.filter((item) => item.completedAt).length
      }));
    }
  } catch {
    // Static fallback below.
  }

  return platformQuests.map((quest) => ({
    slug: quest.slug,
    title: quest.title,
    description: quest.description,
    type: quest.type,
    cadence: quest.cadence ?? "MILESTONE",
    xpReward: quest.xpReward,
    coinReward: quest.coinReward,
    active: true,
    assigned: 0,
    completed: 0
  }));
}

export default async function AdminQuestsPage() {
  await requireAdmin();
  const quests = await getQuests();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="gold">
            <Target className="h-3.5 w-3.5" />
            Retention systems
          </Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Quest Operations</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Tune daily, weekly, milestone, category, and boss quests so users always have a reason to return.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {quests.map((quest) => {
            const completionRate = quest.assigned ? Math.round((quest.completed / quest.assigned) * 100) : 0;
            return (
              <Card key={quest.slug}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{quest.title}</CardTitle>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{quest.description}</p>
                    </div>
                    <Badge variant={quest.active ? "lime" : "slate"}>{quest.active ? "active" : "inactive"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-3 text-sm sm:grid-cols-5">
                    <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{quest.type}</div><div className="text-slate-500">type</div></div>
                    <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{quest.cadence}</div><div className="text-slate-500">cadence</div></div>
                    <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{quest.assigned}</div><div className="text-slate-500">assigned</div></div>
                    <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{quest.xpReward}</div><div className="text-slate-500">XP</div></div>
                    <div className="stat-tile rounded-md p-3"><div className="font-black text-white">{quest.coinReward}</div><div className="text-slate-500">coins</div></div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-between text-sm font-semibold text-slate-300">
                      <span>Completion rate</span>
                      <span>{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} />
                  </div>
                  <div className="flex items-center gap-2 rounded-md border border-lime-300/15 bg-lime-300/8 p-3 text-sm text-lime-50">
                    <CheckCircle2 className="h-4 w-4" />
                    Quest should connect directly to one visible dashboard comeback reason.
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </AppFrame>
  );
}
