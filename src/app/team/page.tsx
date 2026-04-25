import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BarChart3, Settings, Users } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { PlanBadge } from "@/components/billing/plan-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getUserBillingSnapshot } from "@/lib/billing/usage";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const snapshot = await getUserBillingSnapshot(session.user.id);
  const teams = (await canReachDatabase())
    ? await prisma.team.findMany({
        where: { OR: [{ ownerId: session.user.id }, { members: { some: { userId: session.user.id } } }] },
        include: { members: true, plan: true },
        take: 6
      }).catch(() => [])
    : [];

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-7">
          <Badge variant="lime">
            <Users className="h-3.5 w-3.5" />
            Team command room
          </Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Train the squad, not just the solo operator.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Team plans add seats, cohort dashboards, team leaderboards, assignment-ready paths, and progress analytics.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PlanBadge planId={snapshot.plan.id} />
            <Button asChild variant="secondary"><Link href="/team/members">Members</Link></Button>
            <Button asChild variant="secondary"><Link href="/team/analytics">Analytics</Link></Button>
            <Button asChild variant="secondary"><Link href="/team/settings">Settings</Link></Button>
          </div>
        </section>

        {teams.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-slate-300">
                  <div>Plan: {team.plan.name}</div>
                  <div>Seats: {team.members.length}/{team.seatLimit}</div>
                  <div>Billing: {team.stripeSubscriptionId ? "Stripe connected" : "Invite-ready foundation"}</div>
                </CardContent>
              </Card>
            ))}
          </section>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No team workspace yet</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-slate-300">
                Upgrade to Team or contact sales to create a cohort workspace with seats, member roles, assignments, and analytics.
              </p>
              <div className="flex gap-3">
                <Button asChild><Link href="/pricing">View Team Plan</Link></Button>
                <Button asChild variant="secondary"><Link href="/contact-sales">Contact Sales</Link></Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            [Users, "Seat management", "Owner, admin, and member roles are modeled for invites and future SCIM."],
            [BarChart3, "Team analytics", "Track weak categories, completions, leaderboard rank, and assignment progress."],
            [Settings, "Billing governance", "Stripe team subscriptions map to seat limits and team dashboards."]
          ].map(([Icon, title, copy]) => (
            <Card key={String(title)}>
              <CardHeader>
                <Icon className="h-6 w-6 text-cyan-100" />
                <CardTitle>{String(title)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-300">{String(copy)}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </AppFrame>
  );
}
