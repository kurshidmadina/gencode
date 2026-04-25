import { Building2, FileCheck2, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { ContactSalesForm } from "@/components/billing/contact-sales-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Contact Sales",
  description: "Bring Gencode to your team, classroom, bootcamp, or enterprise technical training program."
};

export default function ContactSalesPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <section className="holo-panel rounded-xl p-7">
          <Badge variant="gold">
            <Building2 className="h-3.5 w-3.5" />
            Teams and Enterprise
          </Badge>
          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-6xl">
            Scale technical mastery across your team.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Gencode for teams gives cohorts a technical RPG arena with progress analytics, assignment-ready paths,
            boss battle events, and custom training packs for real Linux, SQL, DSA, debugging, Git, APIs, and DevOps skills.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              [Users, "Seat-based training", "Team plans start at 3 seats with member roles and billing-ready seat limits."],
              [GraduationCap, "Cohort progress", "Track completion, weak skills, path progress, and leaderboard movement."],
              [FileCheck2, "Custom packs", "Enterprise can add private paths, custom challenges, and reports."],
              [ShieldCheck, "Security-ready", "SSO-ready architecture, runner security docs, and admin audit foundations."]
            ].map(([Icon, title, copy]) => (
              <Card key={String(title)}>
                <CardHeader>
                  <Icon className="h-6 w-6 text-cyan-100" />
                  <CardTitle className="text-lg">{String(title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-300">{String(copy)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-slate-950/72 p-6">
          <h2 className="text-2xl font-black text-white">Request a team demo</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This stores a validated sales lead in Postgres when available. Email/CRM automation is documented as the next integration.
          </p>
          <div className="mt-5">
            <ContactSalesForm />
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
