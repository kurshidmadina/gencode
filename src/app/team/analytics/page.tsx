import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Team Analytics" };

export default function TeamAnalyticsPage() {
  return (
    <AppFrame>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Team analytics foundation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-slate-300">
              Team analytics will aggregate completions, weak categories, leaderboard movement, path progress, and assignment outcomes.
              The data model is in place; cohort report exports are the next paid-team milestone.
            </p>
            <Button asChild variant="secondary"><Link href="/team">Back to Team</Link></Button>
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
