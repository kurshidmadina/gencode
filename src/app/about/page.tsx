import Link from "next/link";
import { ArrowRight, Bot, Code2, Cuboid, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "About Gencode",
  description: "The RPG arena for mastering real technical skills."
};

export default function AboutPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <section className="holo-panel overflow-hidden rounded-lg p-8 sm:p-10">
          <Badge variant="cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Product thesis
          </Badge>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-none text-white sm:text-7xl">
            The technical mastery platform built like a game.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Gencode exists for the moment a developer decides to get sharper. The platform turns real Linux, SQL,
            algorithms, debugging, Git, API, DevOps, and interview practice into a visible loop of missions, rewards,
            unlocks, mentorship, and public proof.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/onboarding">
                Start Training
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/demo">Open Demo Flow</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            [Code2, "Real technical reps", "Challenges use realistic scenarios, validation metadata, hints, examples, solutions, and explanations."],
            [Trophy, "Identity and progression", "Ranks, XP, coins, badges, quests, leaderboards, paths, boss battles, and profile proof make improvement visible."],
            [Bot, "Genie as mentor", "The AI layer is contextual, mode-based, voice-capable, and guarded against spoiling learning too early."],
            [Cuboid, "Immersive practice", "WebXR-ready fallback mode gives Gencode a distinct voice-first learning surface."],
            [ShieldCheck, "Secure by design", "Local judging is deterministic and safe; production code execution belongs in isolated runner infrastructure."],
            [Sparkles, "Built for daily return", "The dashboard always points to the next useful mission, weakest skill, streak pressure, and unlock reason."]
          ].map(([Icon, title, copy]) => (
            <Card key={title as string}>
              <CardHeader>
                <Icon className="h-7 w-7 text-cyan-100" />
                <CardTitle>{title as string}</CardTitle>
                <CardDescription>{copy as string}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 rounded-lg border border-white/10 bg-white/6 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge variant="gold">Why it matters</Badge>
            <h2 className="mt-3 text-3xl font-black text-white">Gencode is not trying to be another problem list.</h2>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            The product is designed around a durable learning habit: start from calibration, train with realistic
            challenge rooms, receive coached feedback, claim rewards, unlock harder content, and return tomorrow with
            a clear reason to continue. That is the difference between passive content and an actual technical gym.
          </p>
        </section>
      </main>
    </AppFrame>
  );
}
