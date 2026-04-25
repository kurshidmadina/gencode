import Link from "next/link";
import { ArrowRight, BrainCircuit, Flame, Route, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Onboarding"
};

export default function OnboardingPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-8 shadow-neon">
          <Badge variant="cyan">New operator sequence</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Enter the arena with a path built around your weak spots.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Gencode calibrates your goals, time budget, favorite languages, and uncomfortable topics into a practical technical RPG route.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/onboarding/calibration">
                <Sparkles className="h-4 w-4" />
                Start Calibration
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/paths">
                Browse Paths
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: BrainCircuit, title: "Skill signal", copy: "Tell Gencode what you know, what you avoid, and what you are training for." },
            { icon: Route, title: "Path recommendation", copy: "Get a structured route with milestones, boss gates, and recommended next missions." },
            { icon: Sparkles, title: "Genie context", copy: "Your AI mentor adapts hints and explanations to your path instead of acting like a generic chatbot." }
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <item.icon className="h-6 w-6 text-cyan-100" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-400">{item.copy}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-lime-300/20 bg-lime-300/8">
            <CardHeader>
              <Flame className="h-7 w-7 text-lime-200" />
              <CardTitle className="text-2xl">Why you come back tomorrow</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-6 text-lime-50">
              <p>Your dashboard turns today&apos;s calibration into a comeback cue: protect a streak, close a weak area, unlock a boss gate, or chase the next rank.</p>
              <p>Every clear changes the visible profile: XP, coins, badges, category mastery, and the next recommended room.</p>
            </CardContent>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Beginners are protected", copy: "Easy rooms open first, hints are metered, and Genie nudges instead of dumping answers." },
              { icon: Trophy, title: "Advanced users get pressure", copy: "Boss battles, Arena sprints, Insane rooms, and tradeoff reviews keep the ceiling high." },
              { icon: Sparkles, title: "Profiles become proof", copy: "Ranks, streaks, badges, boss clears, and mastery signals make progress worth sharing." }
            ].map((item) => (
              <Card key={item.title} className="bg-white/6">
                <CardHeader>
                  <item.icon className="h-6 w-6 text-cyan-100" />
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-slate-400">{item.copy}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
