import Link from "next/link";
import { ArrowRight, Bot, ChartNoAxesCombined, Code2, Crown, Gauge, MonitorUp, Route, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { DemoLoginButtons } from "@/components/demo/demo-login-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Demo Control Room"
};

const demoSteps = [
  {
    icon: Sparkles,
    title: "Open with the thesis",
    time: "0:00",
    href: "/",
    copy: "Gencode is the RPG arena for mastering real technical skills: Linux, SQL, DSA, debugging, Git, APIs, and system thinking."
  },
  {
    icon: ShieldCheck,
    title: "Enter seeded demo",
    time: "0:15",
    href: "/login",
    copy: "Use the local demo account so the room immediately sees a populated, believable learner state."
  },
  {
    icon: Gauge,
    title: "Show command center",
    time: "0:30",
    href: "/dashboard",
    copy: "Point at XP, rank, streak, daily quests, weak skills, active path, and recommended next missions."
  },
  {
    icon: Code2,
    title: "Run a real mission",
    time: "0:55",
    href: "/challenges/sql-easy-duplicate-transactions",
    copy: "Run tests, submit, and show reward feedback plus safe validation. This is the core learning rep."
  },
  {
    icon: Bot,
    title: "Summon Genie",
    time: "1:15",
    href: "/challenges/sql-easy-duplicate-transactions",
    copy: "Ask for a hint or failed-test explanation. Genie should guide, not dump answers."
  },
  {
    icon: MonitorUp,
    title: "Convert to immersive",
    time: "1:30",
    href: "/vr/sql-easy-duplicate-transactions",
    copy: "Show browser immersive mode, voice/keyboard commands, floating panels, and the Genie voice companion."
  },
  {
    icon: Trophy,
    title: "Prove retention",
    time: "1:45",
    href: "/leaderboard?scope=weekly",
    copy: "Weekly ladders, quests, streaks, and public profiles explain why users come back tomorrow."
  },
  {
    icon: Crown,
    title: "Close with trust",
    time: "2:00",
    href: "/admin",
    copy: "Admin telemetry, content management, challenge quality, and safety architecture make the product credible to senior engineers."
  }
];

const proofPoints = [
  ["580", "challenge definitions", "Meaningful technical coverage across 18 categories."],
  ["16", "learning paths", "Structured routes from first rep to boss battles."],
  ["7", "seeded operators", "Believable demo data with ranks, submissions, badges, quests, and VR sessions."],
  ["0", "host code execution", "Safe local runner abstraction with production isolation docs."]
];

export default function DemoPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-6 shadow-neon lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <Badge variant="gold">Investor demo control room</Badge>
              <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
                Make Gencode land in two minutes.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                This route is the presenter cockpit: one-click demo login, exact story beats, and links into every proof surface investors, users, and senior engineers will ask about.
              </p>
              <div className="mt-6 grid gap-3 rounded-lg border border-cyan-300/15 bg-cyan-300/8 p-4">
                <div className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Local demo credentials</div>
                <div className="grid gap-1 font-mono text-sm text-slate-200">
                  <span>User: demo@gencode.dev / GencodeDemo!2026</span>
                  <span>Admin: admin@gencode.dev / GencodeAdmin!2026</span>
                </div>
                <p className="text-xs leading-5 text-slate-400">These are local seeded demo accounts only. Never use them in production.</p>
                <DemoLoginButtons />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {proofPoints.map(([value, label, copy]) => (
                <div key={label} className="stat-tile rounded-lg p-5">
                  <div className="text-4xl font-black text-white">{value}</div>
                  <div className="mt-1 text-xs font-black uppercase tracking-[0.22em] text-slate-400">{label}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Route className="h-6 w-6 text-cyan-100" />
                Two-minute walkthrough
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {demoSteps.map((step) => (
                <Link
                  key={step.title}
                  href={step.href}
                  className="surface-lift grid gap-3 rounded-lg border border-white/10 bg-white/6 p-4 md:grid-cols-[72px_1fr_auto] md:items-center"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-50">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="slate">{step.time}</Badge>
                      <h2 className="font-black text-white">{step.title}</h2>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{step.copy}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-cyan-100" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="grid content-start gap-4">
            <Card className="border-lime-300/20 bg-lime-300/8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartNoAxesCombined className="h-5 w-5 text-lime-100" />
                  What to say
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-slate-300">
                <p>
                  “Gencode turns technical upskilling into a daily RPG loop: calibrate, train, get feedback, earn XP, unlock harder missions, and come back for streaks, quests, bosses, and leaderboard pressure.”
                </p>
                <p>
                  “The differentiation is not just more coding problems. It is realistic mixed-skill missions, contextual Genie coaching, safe validation, public proof, and immersive voice-first practice.”
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-yellow-100" />
                  Fast links
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {[
                  ["/profile/nova_cli", "Public profile proof"],
                  ["/paths/sql-analyst", "Recommended path"],
                  ["/boss-battles/sql-fraud-detection-boss", "Boss battle"],
                  ["/shop", "Cosmetic reward shop"],
                  ["/admin/analytics", "Admin analytics"]
                ].map(([href, label]) => (
                  <Button key={href} asChild variant="secondary">
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}
