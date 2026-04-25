import { AppFrame } from "@/components/layout/app-frame";
import { PricingClient } from "@/components/billing/pricing-client";

export const metadata = {
  title: "Pricing",
  description: "Choose your Gencode plan: Free, Starter, Pro, Elite, Team, or Enterprise technical mastery."
};

export default function PricingPage() {
  return (
    <AppFrame>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PricingClient />
      </main>
    </AppFrame>
  );
}
