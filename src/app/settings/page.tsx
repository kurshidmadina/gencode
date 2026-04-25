import { AppFrame } from "@/components/layout/app-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7">
          <Badge variant="cyan">Operator tuning</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Tune the way Gencode trains you.</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Set your public signal, favorite arenas, and default Genie protocol so recommendations feel personal.
          </p>
          <Button asChild className="mt-5" variant="secondary">
            <Link href="/settings/billing">Manage Billing</Link>
          </Button>
        </section>
        <Card>
          <CardHeader>
            <CardTitle>Training Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
