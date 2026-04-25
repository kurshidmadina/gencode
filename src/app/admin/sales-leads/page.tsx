import { Building2, Mail } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = { title: "Admin Sales Leads" };

export default async function AdminSalesLeadsPage() {
  await requireAdmin();
  const leads = (await canReachDatabase())
    ? await prisma.salesLead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }).catch(() => [])
    : [];

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-7">
          <Badge variant="cyan">
            <Mail className="h-3.5 w-3.5" />
            Sales pipeline
          </Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Enterprise and team leads.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Validated contact-sales submissions are stored here. Connect email/CRM automation when the sales motion is ready.
          </p>
        </section>
        {leads.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm leading-6 text-slate-300">
              No leads yet. Submit the Contact Sales form to verify the pipeline.
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-100" />
                    {lead.organization ?? lead.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm text-slate-300">
                  <div>{lead.name} · {lead.email}</div>
                  <div>Use case: {lead.useCase} · Team size: {lead.teamSize ?? "unknown"} · Status: {lead.status}</div>
                  <p className="leading-6">{lead.message}</p>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>
    </AppFrame>
  );
}
