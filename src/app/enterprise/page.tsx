import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, KeyRound, ShieldCheck } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Enterprise",
  description: "Enterprise-ready technical training with custom Gencode challenge packs, analytics, and SSO-ready architecture."
};

export default function EnterprisePage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-8 text-center">
          <Badge variant="violet">Enterprise command layer</Badge>
          <h1 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-none text-white sm:text-7xl">
            Custom technical mastery infrastructure.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Private learning paths, custom challenge packs, cohort analytics, security review support, and contract-ready
            architecture for companies, bootcamps, colleges, and hiring teams.
          </p>
          <Button asChild className="mt-7" variant="gold">
            <Link href="/contact-sales">
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
        <section className="grid gap-5 md:grid-cols-4">
          {[
            [Boxes, "Private content", "Custom packs for Linux, SQL, DSA, APIs, debugging, DevOps, and internal systems."],
            [BarChart3, "Analytics", "Cohort progress, weak skills, challenge failure rates, and export-ready reports."],
            [KeyRound, "SSO-ready", "Architecture placeholders for SSO, SCIM, contracts, invoice records, and seat governance."],
            [ShieldCheck, "Security review", "Runner isolation model, billing safety, admin audit logs, and deployment docs."]
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
