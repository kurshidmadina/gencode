"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ContactSalesForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    const response = await fetch("/api/sales-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        organization: form.get("organization"),
        teamSize: Number(form.get("teamSize") || 1),
        useCase: form.get("useCase"),
        message: form.get("message"),
        source: "contact-sales"
      })
    });
    const data = (await response.json().catch(() => null)) as { error?: string; persisted?: boolean } | null;
    setLoading(false);
    if (!response.ok) {
      toast.error(data?.error ?? "Could not send sales request.");
      return;
    }
    setSent(true);
    toast.success(data?.persisted === false ? "Request captured locally. Connect Postgres to persist leads." : "Sales request sent.");
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-lime-300/25 bg-lime-300/10 p-6">
        <h2 className="text-2xl font-black text-white">Signal received.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Your team request is in the Gencode pipeline. The next step is connecting email/CRM automation for production outreach.
        </p>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Name
        <Input name="name" required placeholder="Maya Chen" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Work email
        <Input name="email" required type="email" placeholder="maya@company.com" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Company or school
        <Input name="organization" placeholder="Northstar Bootcamp" />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Team size
        <Input name="teamSize" type="number" min={1} max={100000} defaultValue={12} />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Use case
        <Select name="useCase" defaultValue="team-training">
          <option value="team-training">Team training</option>
          <option value="bootcamp">Bootcamp / classroom</option>
          <option value="interview-prep">Interview preparation cohort</option>
          <option value="hiring">Hiring and assessment</option>
          <option value="enterprise">Enterprise upskilling</option>
        </Select>
      </label>
      <label className="grid gap-2 text-sm font-semibold text-slate-300">
        Message
        <Textarea name="message" required placeholder="Tell us what skills your team needs to build and how many learners are involved." />
      </label>
      <Button disabled={loading} type="submit" variant="gold">
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Request Team Demo"}
      </Button>
    </form>
  );
}
