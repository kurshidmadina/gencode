"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BrainCircuit, CheckCircle2, Flame, Play, RotateCcw, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { arenaModes, scoreArenaRun, type ArenaMode } from "@/lib/game/arena";
import type { GeneratedChallenge } from "@/lib/game/types";

type ArenaResult = ReturnType<typeof scoreArenaRun> & {
  persisted?: boolean;
  runId?: string | null;
  rewardPreview?: { xp: number; coins: number };
  message?: string;
};

function isArenaResult(data: ArenaResult | { error?: string } | null): data is ArenaResult {
  return Boolean(data && "score" in data && "accuracy" in data);
}

export function ArenaClient({ challenges }: { challenges: GeneratedChallenge[] }) {
  const [selected, setSelected] = useState<ArenaMode>(arenaModes[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ArenaResult | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pool = useMemo(
    () =>
      challenges
        .filter((challenge) => selected.categories.includes(challenge.categorySlug))
        .filter((challenge) => selected.difficulties.includes(challenge.difficulty))
        .slice(0, 5),
    [challenges, selected]
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  async function start() {
    setBusy(true);
    setResult(null);
    setRunId(null);
    setRunning(true);
    const response = await fetch("/api/arena/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start",
        modeSlug: selected.slug,
        challengeSlugs: pool.map((challenge) => challenge.slug)
      })
    });
    const data = (await response.json().catch(() => null)) as { runId?: string | null; persisted?: boolean; message?: string; error?: string } | null;
    setBusy(false);
    if (!response.ok) {
      setRunId(null);
      setRunning(true);
      toast.error(data?.error ?? "Arena could not sync, so this run is starting locally.");
      return;
    }
    setRunId(data?.runId ?? null);
    toast.message(data?.persisted ? "Arena run persisted. Clock armed." : data?.message ?? "Arena run started locally.");
  }

  async function finishDemoRun() {
    const correct = Math.max(1, Math.min(4, pool.length - 1));
    setBusy(true);
    const response = await fetch("/api/arena/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        ...(runId ? { runId } : {}),
        modeSlug: selected.slug,
        challengeSlugs: pool.map((challenge) => challenge.slug),
        correct,
        attempted: Math.max(pool.length, 1),
        secondsRemaining: 147,
        hintsUsed: 0
      })
    });
    const data = (await response.json().catch(() => null)) as ArenaResult | { error?: string } | null;
    setBusy(false);
    if (!response.ok || !isArenaResult(data)) {
      toast.error((data && "error" in data && data.error) || "Arena result could not be saved.");
      return;
    }
    setResult(data);
    setRunning(false);
    setRunId(null);
    toast.success(data.persisted ? "Arena run saved." : "Arena run scored locally.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Arena modes</CardTitle>
          <p className="text-sm text-slate-400">Timed practice with scoring, speed bonuses, and no-hint rewards.</p>
        </CardHeader>
        <CardContent className="grid gap-3">
          {arenaModes.map((mode) => (
            <button
              key={mode.slug}
              type="button"
              onClick={() => {
                setSelected(mode);
                setRunning(false);
                setResult(null);
                setRunId(null);
              }}
              className={`rounded-md border p-4 text-left transition ${
                selected.slug === mode.slug ? "border-cyan-200 bg-cyan-300/15" : "border-white/10 bg-white/6 hover:border-cyan-300/40"
              }`}
            >
              <div className="font-black text-white">{mode.name}</div>
              <div className="mt-1 text-sm leading-6 text-slate-400">{mode.description}</div>
            </button>
          ))}
        </CardContent>
      </Card>
      <div className="grid gap-6">
        <Card className="holo-panel">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold">{selected.durationMinutes} minutes</Badge>
              {selected.categories.map((category) => (
                <Badge key={category} variant="slate">{category}</Badge>
              ))}
            </div>
            <CardTitle className="text-3xl">{selected.name}</CardTitle>
            <p className="text-sm leading-6 text-slate-400">{selected.description}</p>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-3 md:grid-cols-3">
              {selected.rules.map((rule) => (
                <div key={rule} className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{rule}</div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={start} disabled={busy || !hydrated}>
                <Play className="h-4 w-4" />
                {!hydrated ? "Arming..." : busy ? "Syncing..." : "Start Arena"}
              </Button>
              <Button type="button" variant="secondary" onClick={finishDemoRun} disabled={!running || busy}>
                <CheckCircle2 className="h-4 w-4" />
                Finish Practice Run
              </Button>
              <Button type="button" variant="secondary" onClick={() => { setRunning(false); setResult(null); setRunId(null); }}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            {running ? (
              <div className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-4">
                <div className="mb-2 flex items-center justify-between text-sm font-black text-cyan-50">
                  <span className="flex items-center gap-2"><Timer className="h-4 w-4" /> Arena clock armed</span>
                  <span>{selected.durationMinutes}:00</span>
                </div>
                <Progress value={24} indicatorClassName="bg-arena-glow" />
              </div>
            ) : null}
            {result ? (
              <div className="completion-burst rounded-md border border-lime-300/25 bg-lime-300/10 p-4">
                <div className="flex items-center gap-2 text-lg font-black text-white">
                  <Flame className="h-5 w-5 text-lime-200" />
                  Arena score {result.score}
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
                  <span>Accuracy {result.accuracy}%</span>
                  <span>Speed bonus {result.speedBonus}</span>
                  <span>No-hint bonus {result.noHintBonus}</span>
                </div>
                <div className="mt-3 text-sm text-lime-50">
                  {result.persisted ? "Run history saved to your arena profile." : result.message ?? "Run scored locally."}
                  {result.rewardPreview ? ` Reward preview: ${result.rewardPreview.xp} XP / ${result.rewardPreview.coins} coins.` : ""}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
              Mission draw
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {pool.map((challenge) => (
              <Link key={challenge.slug} href={`/challenges/${challenge.slug}`} className="flex items-center justify-between rounded-md border border-white/10 bg-white/6 p-4 transition hover:border-cyan-300/40">
                <div>
                  <div className="font-black text-white">{challenge.title}</div>
                  <div className="text-sm text-slate-400">{challenge.subtitle}</div>
                </div>
                <Badge variant="gold">{challenge.difficulty}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
