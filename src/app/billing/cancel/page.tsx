import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Checkout Canceled"
};

export default function BillingCancelPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <section className="holo-panel rounded-xl p-8">
          <Badge variant="gold">
            <ShieldCheck className="h-3.5 w-3.5" />
            Checkout canceled safely
          </Badge>
          <h1 className="mt-5 text-5xl font-black text-white">No charge was made.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            You can keep training on Free and upgrade when the arena starts paying for itself in momentum, interview confidence,
            or team progress.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary">
              <Link href="/pricing">
                <ArrowLeft className="h-4 w-4" />
                Return to pricing
              </Link>
            </Button>
            <Button asChild>
              <Link href="/challenges">Keep Training Free</Link>
            </Button>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
