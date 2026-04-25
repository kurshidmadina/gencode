import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Team Members" };

export default function TeamMembersPage() {
  return (
    <AppFrame>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Team member management</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-slate-300">
              Seat models, owner/admin/member roles, and Stripe team plan limits are implemented. Email invitations are the next integration.
            </p>
            <Button asChild variant="secondary"><Link href="/team">Back to Team</Link></Button>
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
