import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Boxes, BrainCircuit, Code2, Crown, Headphones, HelpCircle, Layers3, Map, Route, ShieldCheck, ShoppingBag, Sparkles, Swords, Trophy, WandSparkles } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { ArenaHeroScene } from "@/components/landing/arena-hero-scene";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categories, difficulties } from "@/lib/game/types";
import { challengeCatalog, getFeaturedChallenges } from "@/lib/game/challenge-data";

export default async function LandingPage() {
  const featured = getFeaturedChallenges(6);
  const challengeCount = challengeCatalog.length;
  const categoryCount = categories.length;

  return (
    <AppFrame>
      <main>
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-14 sm:px-6 lg:px-8">
          <ArenaHeroScene />
          <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-7xl content-center gap-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
            <div className="max-w-4xl">
              <Badge variant="cyan">
                <Sparkles className="h-3.5 w-3.5" />
                Technical RPG arena
              </Badge>
              <h1 className="mt-6 max-w-4xl text-balance text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-8xl">
                Gencode
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-200">
                Level up Linux, SQL, algorithms, debugging, Git, APIs, and coding-language fluency through intelligent arena missions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/onboarding">
                    Start Calibration
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/vr">
                    <WandSparkles className="h-5 w-5" />
                    Convert to VR
                  </Link>
                </Button>
              </div>
              <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
                {["No host code execution", "Genie hint guardrails", "WebXR-ready practice"].map((item) => (
                  <div key={item} className="rounded-md border border-white/10 bg-white/6 px-3 py-2 font-semibold">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="holo-panel rounded-lg p-4 shadow-neon">
              <div className="rounded-md border border-white/10 bg-slate-950/75 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.25em] text-cyan-100">Live command deck</div>
                    <div className="mt-2 text-2xl font-black text-white">Terminal Rookie</div>
                  </div>
                  <Badge variant="gold">Level 5</Badge>
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-xs font-bold text-slate-300">
                    <span>2,840 XP</span>
                    <span>67% to Query Knight</span>
                  </div>
                  <Progress value={67} />
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    ["6", "day streak"],
                    ["410", "coins"],
                    ["27", "clears"]
                  ].map(([value, label]) => (
                    <div key={label} className="stat-tile rounded-md p-3">
                      <div className="text-2xl font-black text-white">{value}</div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3">
                  {featured.slice(0, 3).map((challenge) => (
                    <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="surface-lift grid gap-1 rounded-md border border-cyan-300/15 bg-cyan-300/8 p-3 transition hover:border-cyan-300/40">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-white">{challenge.title}</span>
                        <span className="text-xs font-black text-yellow-100">{challenge.xpReward} XP</span>
                      </div>
                      <div className="text-xs text-slate-400">{challenge.categorySlug} / {challenge.difficulty}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
              {[
                [challengeCount.toLocaleString(), "seeded challenges"],
                [categoryCount.toLocaleString(), "skill categories"],
                ["5", "difficulty tiers"]
              ].map(([value, label]) => (
                <div key={label} className="stat-tile rounded-lg p-5 backdrop-blur-xl">
                  <div className="text-4xl font-black text-white">{value}</div>
                  <div className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-cyan-300/10 bg-slate-950/80 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <Badge variant="gold">2-minute demo path</Badge>
              <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                Show the whole product loop before the room gets restless.
              </h2>
              <p className="mt-3 leading-7 text-slate-300">
                Login with the seeded demo account, open the command center, run a recommended mission, ask Genie for a guarded hint, then jump into browser immersive mode. The story lands fast: skill growth becomes a game loop.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/demo">
                    Open Demo Control Room
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/leaderboard?scope=weekly">Show Weekly Ladder</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["1", "Landing", "Gencode is the RPG arena for real technical mastery."],
                ["2", "Dashboard", "XP, streak, quests, path progress, and next mission are visible immediately."],
                ["3", "Challenge", "Run tests, submit safely, earn rewards, and see why the answer passed."],
                ["4", "Genie + VR", "Ask for contextual coaching, then convert the mission into an immersive command room."],
                ["5", "Leaderboard", "Weekly pressure gives users a reason to come back tomorrow."],
                ["6", "Profile/Admin", "Shareable proof for users; quality telemetry for operators."]
              ].map(([step, title, copy]) => (
                <div key={step} className="surface-lift rounded-lg border border-white/10 bg-white/6 p-4">
                  <div className="grid h-9 w-9 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/12 text-sm font-black text-cyan-50">
                    {step}
                  </div>
                  <div className="mt-3 font-black text-white">{title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-cyan-300/10 bg-slate-950/75 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <Badge variant="lime">Why people switch</Badge>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                  LeetCode gives problems. Gencode gives a technical identity loop.
                </h2>
              </div>
              <p className="leading-7 text-slate-300">
                The product is built around the first 10 minutes and the next day: calibrate, clear one realistic mission, get Genie feedback, earn visible progression, and return with a queued reason to keep training.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                [BrainCircuit, "Beginners start safely", "Easy rooms, guided hints, and one-mechanic missions prevent the blank-screen panic."],
                [Swords, "Advanced users get pressure", "Boss battles, Arena sprints, hard unlock gates, and tradeoff reviews raise the ceiling."],
                [Bot, "Genie is a mentor", "Contextual coaching nudges reasoning, reviews failures, and protects against answer dumping."],
                [Map, "Progress is visible", "Ranks, maps, quests, mastery bars, streaks, badges, and profiles make training feel alive."],
                [WandSparkles, "The world is distinct", "Voice and immersive mode make Gencode feel like a futuristic developer training arena."]
              ].map(([Icon, title, copy]) => (
                <Card key={title as string} className="bg-white/6">
                  <CardHeader>
                    <Icon className="h-7 w-7 text-cyan-100" />
                    <CardTitle>{title as string}</CardTitle>
                    <CardDescription>{copy as string}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/signup">Start Training</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/onboarding/calibration">Take Skill Calibration</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/arena">Enter Arena</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/challenges">Explore Challenges</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y border-cyan-300/10 bg-slate-950/70 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8">
            <div>
              <Badge variant="cyan">Product loop</Badge>
              <h2 className="mt-3 max-w-3xl text-3xl font-black text-white">
                Calibrate, train, earn, unlock, return tomorrow.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Gencode now routes learners through onboarding, path milestones, boss gates, arena sprints, cosmetic rewards, and a map that makes progress visible.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {[
                [Route, "Learning Paths", "/paths", "Ordered mission arcs with milestones and final boss gates."],
                [Swords, "Boss Battles", "/boss-battles", "Multi-stage technical scenarios that test combined skill."],
                [Trophy, "Arena Mode", "/arena", "Timed sprints for accuracy, speed, and no-hint bonuses."],
                [Map, "Academy Map", "/map", "A game-style world view of categories and locked realms."],
                [ShoppingBag, "Reward Shop", "/shop", "Cosmetics bought with coins, never power."]
              ].map(([Icon, title, href, copy]) => (
                <Link key={title as string} href={href as string} className="group rounded-lg border border-white/10 bg-white/6 p-4 transition hover:-translate-y-1 hover:border-cyan-300/35">
                  <Icon className="h-7 w-7 text-cyan-100" />
                  <div className="mt-4 font-black text-white">{title as string}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{copy as string}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cyan-100">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/60 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge variant="gold">Challenge Grid</Badge>
                <h2 className="mt-3 text-3xl font-black text-white">Train across the full technical map</h2>
              </div>
              <Button asChild variant="secondary">
                <Link href="/challenges">Browse Catalog</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Card key={category.slug} className="bg-slate-900/60">
                  <CardHeader>
                    <div className="grid h-10 w-10 place-items-center rounded-md" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
                      <Code2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription className="line-clamp-3">{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8">
            <div>
              <Badge variant="cyan">How it works</Badge>
              <h2 className="mt-3 text-3xl font-black text-white">A technical RPG loop built for real skill</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                [Layers3, "Pick an arena", "Choose Linux, SQL, algorithms, debugging, Git, APIs, or language tracks."],
                [Code2, "Solve in context", "Use the editor, SQL pad, terminal simulation, examples, hints, and visible checks."],
                [Trophy, "Earn rewards", "Submit for XP, coins, badges, streak progress, and category mastery."],
                [BarChart3, "Train smarter", "Genie and analytics point you toward weak skills and next unlocks."]
              ].map(([Icon, title, copy]) => (
                <Card key={title as string}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-arena-glow" />
                    <CardTitle>{title as string}</CardTitle>
                    <CardDescription>{copy as string}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <Card>
              <CardHeader>
                <Badge variant="pink">Progression</Badge>
                <CardTitle className="text-3xl">Unlock harder arenas by proving mastery</CardTitle>
                <CardDescription>Easy opens first. Medium, Hard, Extreme, and Insane unlock as completions accumulate.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {difficulties.map((difficulty, index) => (
                  <div key={difficulty} className="grid gap-2">
                    <div className="flex justify-between text-sm font-semibold text-slate-300">
                      <span>{difficulty}</span>
                      <span>{index === 0 ? "Open" : `${index * 6 + 2} clears`}</span>
                    </div>
                    <Progress value={index === 0 ? 100 : 20 + index * 16} indicatorClassName={index > 2 ? "bg-arena-pulse" : "bg-arena-glow"} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="cyan">Genie Mentor</Badge>
                <CardTitle className="text-3xl">Hints, voice, interviews, and debug coaching</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  [Bot, "Context-aware hint policy"],
                  [Headphones, "Voice input and speech output"],
                  [ShieldCheck, "Guardrails against instant answer leaking"],
                  [Boxes, "Challenge-aware explanations"]
                ].map(([Icon, label]) => (
                  <div key={label as string} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/6 p-3 text-sm font-semibold text-slate-200">
                    <Icon className="h-5 w-5 text-arena-glow" />
                    {label as string}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/60 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <Badge variant="lime">Featured Runs</Badge>
              <h2 className="mt-3 text-3xl font-black text-white">The next few doors are already lit</h2>
              <p className="mt-4 leading-7 text-slate-400">
                Every card has XP, coins, tags, type-specific validation metadata, hints, and unlock rules.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {featured.map((challenge) => (
                <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="rounded-lg border border-white/10 bg-slate-900/70 p-4 transition hover:border-cyan-300/40">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="cyan">{challenge.categorySlug}</Badge>
                    <span className="text-sm font-black text-yellow-100">{challenge.xpReward} XP</span>
                  </div>
                  <div className="mt-3 font-bold text-white">{challenge.title}</div>
                  <div className="mt-2 text-sm text-slate-400">{challenge.difficulty} / {challenge.type.replaceAll("_", " ")}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Crown className="h-8 w-8 text-yellow-200" />
                <CardTitle>Leaderboards</CardTitle>
                <CardDescription>Global, weekly, and category ladders rank XP, completions, streaks, and hard clears.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Trophy className="h-8 w-8 text-cyan-200" />
                <CardTitle>Badges</CardTitle>
                <CardDescription>First Blood, SQL Starter, Linux Monk, DSA Climber, Insane Survivor, and streak awards.</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <WandSparkles className="h-8 w-8 text-lime-200" />
                <CardTitle>Startup-ready pricing</CardTitle>
                <CardDescription>Start free, upgrade to Pro for the core arena, or unlock Elite, Team, and Enterprise training systems.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="secondary">
                  <Link href="/pricing">View launch pricing</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/60 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <Badge variant="pink">Why Gencode is different</Badge>
              <h2 className="mt-3 text-3xl font-black text-white">Not a quiz site. A repeatable training system.</h2>
              <p className="mt-4 leading-7 text-slate-400">
                Realistic engineering scenarios, structured progression, safe validation, AI mentoring, admin analytics, and immersive practice make Gencode feel like leveling a technical character.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Production-style Linux, SQL, Git, API, and debugging missions",
                "Difficulty unlocks and prerequisites build durable fundamentals",
                "Genie nudges, interviews, and reviews without spoiling first",
                "Secure runner architecture and audit logs support serious teams"
              ].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/6 p-4 text-sm font-semibold leading-6 text-slate-200">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-cyan-200" />
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm leading-6 text-slate-300">
                <p><strong className="text-white">Does Gencode execute user code on the host?</strong> No. Local mode uses a safe mock judge; production runner design is isolated.</p>
                <p><strong className="text-white">Can Genie give full answers?</strong> Genie starts with hints and reasoning. Full dumps are guarded unless explicitly allowed.</p>
                <p><strong className="text-white">Is VR required?</strong> No. Immersive mode works as a WebXR-ready 3D fallback in normal browsers.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Crown className="h-8 w-8 text-yellow-200" />
                <CardTitle>Monetization without pay-to-win</CardTitle>
                <CardDescription>Plans unlock coaching depth, challenge access, analytics, teams, and VR. XP and mastery stay earned.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/pricing">Choose Your Plan</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 px-4 py-8 text-sm text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Gencode is built for secure technical growth: no arbitrary code execution in the app process, no client secrets, and a Docker-isolated runner path for production.
          </p>
          <div className="flex flex-wrap gap-4 font-bold text-slate-300">
            <Link href="/about" className="hover:text-cyan-100">About</Link>
            <Link href="/pricing" className="hover:text-cyan-100">Pricing</Link>
            <Link href="/demo" className="hover:text-cyan-100">Demo</Link>
          </div>
        </div>
      </footer>
    </AppFrame>
  );
}
