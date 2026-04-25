import Link from "next/link";
import { ArrowRight, BadgeCheck, BrainCircuit, Sparkles } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { SignupForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Sign Up"
};

export default function SignupPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl content-center gap-8 px-4 py-12 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="cyan">
            <Sparkles className="h-3.5 w-3.5" />
            First 10 minutes matter
          </Badge>
          <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">
            Create your operator profile, then go straight into calibration.
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Gencode asks what you want, finds the right path, queues one safe starter mission, and turns the first clear into XP, coins, and badge progress.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [BrainCircuit, "Calibrate"],
              [ArrowRight, "Start mission"],
              [BadgeCheck, "Earn identity"]
            ].map(([Icon, label]) => (
              <div key={label as string} className="rounded-md border border-white/10 bg-white/6 p-4">
                <Icon className="h-5 w-5 text-cyan-100" />
                <div className="mt-3 font-black text-white">{label as string}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="grid content-center gap-5">
          <SignupForm />
          <p className="text-center text-sm text-slate-400">
            Already training? <Link className="font-semibold text-cyan-200" href="/login">Login</Link>
          </p>
        </section>
      </main>
    </AppFrame>
  );
}
