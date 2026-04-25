import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Billing Success"
};

export default function BillingSuccessPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-8">
          <Badge variant="lime">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Plan upgrade initiated
          </Badge>
          <h1 className="mt-5 text-5xl font-black text-white">Your new arena access is being activated.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Stripe confirmed checkout. Webhooks update your subscription state server-side; if the badge does not change immediately,
            refresh billing settings after the webhook lands.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <Link href="/dashboard">
                <Sparkles className="h-4 w-4" />
                Start training with your plan
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings/billing">View billing status</Link>
            </Button>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
