"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { BillingInterval, PlanId } from "@/lib/billing/plans";

export function CheckoutButton({
  planId,
  interval,
  children,
  variant = "primary",
  teamSeats
}: {
  planId: Exclude<PlanId, "free" | "enterprise">;
  interval: BillingInterval;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "gold" | "ghost";
  teamSeats?: number;
}) {
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, billingInterval: interval, teamSeats })
    });
    const data = (await response.json().catch(() => null)) as { url?: string; error?: string; message?: string } | null;
    setLoading(false);
    if (!response.ok || !data?.url) {
      toast.error(data?.message ?? data?.error ?? "Checkout is not ready yet. Configure Stripe price IDs first.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <Button type="button" variant={variant} disabled={loading} onClick={startCheckout}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      {children}
    </Button>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
    setLoading(false);
    if (!response.ok || !data?.url) {
      toast.error(data?.error ?? "Billing portal is not configured yet.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <Button type="button" variant="secondary" onClick={openPortal} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
      Manage Billing
    </Button>
  );
}
