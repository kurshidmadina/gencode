import Link from "next/link";
import { BrainCircuit, Flame, ShieldCheck } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { LoginForm } from "@/components/auth/auth-form";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl content-center gap-8 px-4 py-12 lg:grid-cols-[1fr_430px] lg:px-8">
        <section className="holo-panel rounded-lg p-7">
          <Badge variant="cyan">Return to the arena</Badge>
          <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl">Your streak, rank, and next mission are waiting.</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            Login to continue your path, ask Genie for the next rep, or jump into a timed arena sprint.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              [Flame, "Protect streak"],
              [BrainCircuit, "Restore Genie context"],
              [ShieldCheck, "Secure progress"]
            ].map(([Icon, label]) => (
              <div key={label as string} className="stat-tile rounded-md p-4">
                <Icon className="h-5 w-5 text-cyan-100" />
                <div className="mt-3 font-black text-white">{label as string}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="grid content-center gap-5">
          <LoginForm />
          <p className="text-center text-sm text-slate-400">
            New to Gencode? <Link className="font-semibold text-cyan-200" href="/signup">Create an operator profile</Link>
          </p>
        </section>
      </main>
    </AppFrame>
  );
}
