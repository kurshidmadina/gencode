import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Code2, CreditCard, FileSearch, LineChart, Mail, Route, ShoppingBag, Swords, Users } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canReachDatabase } from "@/lib/db-health";
import { challengeCatalog } from "@/lib/game/challenge-data";
import { bossBattles } from "@/lib/game/boss-battles";
import { learningPaths } from "@/lib/game/learning-paths";
import { shopItems } from "@/lib/game/shop";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin"
};

async function getStats() {
  if (!(await canReachDatabase())) {
    return { users: 2, challenges: challengeCatalog.length, submissions: 0, completionRate: 0, paths: learningPaths.length, bosses: bossBattles.length, shopItems: shopItems.length, subscriptions: 0, salesLeads: 0 };
  }

  try {
    const [users, challenges, submissions, passed, paths, bosses, shopItemCount] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PASSED" } }),
      prisma.learningPath.count(),
      prisma.bossBattle.count(),
      prisma.shopItem.count()
    ]);
    const [subscriptions, salesLeads] = await Promise.all([
      prisma.userSubscription.count().catch(() => 0),
      prisma.salesLead.count().catch(() => 0)
    ]);
    return { users, challenges, submissions, completionRate: submissions ? Math.round((passed / submissions) * 100) : 0, paths, bosses, shopItems: shopItemCount, subscriptions, salesLeads };
  } catch {
    return { users: 2, challenges: challengeCatalog.length, submissions: 0, completionRate: 0, paths: learningPaths.length, bosses: bossBattles.length, shopItems: shopItems.length, subscriptions: 0, salesLeads: 0 };
  }
}

export default async function AdminPage() {
  await requireAdmin();
  const stats = await getStats();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">Admin Command Center</h1>
            <p className="mt-2 max-w-3xl text-slate-300">Operate the arena: content quality, learner safety, submissions, and platform telemetry.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="secondary"><Link href="/admin/challenges">Manage Challenges</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/paths">Paths</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/boss-battles">Bosses</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/quests">Quests</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/users">Manage Users</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/submissions">Submissions</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/analytics">Analytics</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/billing">Billing</Link></Button>
            <Button asChild variant="secondary"><Link href="/admin/sales-leads">Sales Leads</Link></Button>
          </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-9">
          {([
            { Icon: Users, label: "Users", value: stats.users },
            { Icon: Code2, label: "Challenges", value: stats.challenges },
            { Icon: FileSearch, label: "Submissions", value: stats.submissions },
            { Icon: LineChart, label: "Completion", value: `${stats.completionRate}%` },
            { Icon: Route, label: "Paths", value: stats.paths },
            { Icon: Swords, label: "Bosses", value: stats.bosses },
            { Icon: ShoppingBag, label: "Shop", value: stats.shopItems },
            { Icon: CreditCard, label: "Billing", value: stats.subscriptions },
            { Icon: Mail, label: "Leads", value: stats.salesLeads }
          ] satisfies Array<{ Icon: LucideIcon; label: string; value: string | number }>).map(({ Icon, label, value }) => (
            <Card key={label as string}>
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
      </main>
    </AppFrame>
  );
}
