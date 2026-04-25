import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Team Settings" };

export default function TeamSettingsPage() {
  return (
    <AppFrame>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Team settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm leading-6 text-slate-300">
              Team billing, seat limits, and member roles are ready. Future work adds invitation policy, SSO mapping, and assignment defaults.
            </p>
            <Button asChild variant="secondary"><Link href="/settings/billing">Open Billing</Link></Button>
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
