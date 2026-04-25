"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Play, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Stage = {
  title: string;
};

type BossProgress = {
  currentStage: number;
  bestScore: number;
  status: string;
};

type BossAttempt = {
  id: string;
  stageIndex: number;
  status: string;
  score: number;
  createdAt: string;
};

export function BossProgressPanel({ bossSlug, stages }: { bossSlug: string; stages: Stage[] }) {
  const [progress, setProgress] = useState<BossProgress | null>(null);
  const [attempts, setAttempts] = useState<BossAttempt[]>([]);
  const [busy, setBusy] = useState(false);
  const currentStage = Math.min(progress?.currentStage ?? 0, Math.max(0, stages.length - 1));
  const completion = stages.length ? ((progress?.status === "COMPLETED" ? stages.length : currentStage) / stages.length) * 100 : 0;

  useEffect(() => {
    let mounted = true;
    async function loadProgress() {
      const response = await fetch(`/api/boss-battles/${bossSlug}/progress`);
      const data = (await response.json().catch(() => null)) as { progress?: BossProgress | null; attempts?: BossAttempt[] } | null;
      if (!mounted) return;
      setProgress(data?.progress ?? null);
      setAttempts(data?.attempts ?? []);
    }
    void loadProgress();
    return () => {
      mounted = false;
    };
  }, [bossSlug]);

  async function save(status: "STARTED" | "STAGE_CLEARED" | "COMPLETED") {
    setBusy(true);
    const response = await fetch(`/api/boss-battles/${bossSlug}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stageIndex: currentStage,
        score: status === "STARTED" ? progress?.bestScore ?? 0 : Math.min(100, 68 + currentStage * 9),
        status,
        notes: status === "STARTED" ? "Boss stage started from the web arena." : `Cleared ${stages[currentStage]?.title ?? "stage"}.`
      })
    });
    const data = (await response.json().catch(() => null)) as { progress?: BossProgress; attempt?: BossAttempt; error?: string } | null;
    setBusy(false);

    if (!response.ok) {
      toast.error(data?.error ?? "Boss progress could not be saved.");
      return;
    }

    if (data?.progress) setProgress(data.progress);
    if (data?.attempt) setAttempts((current) => [data.attempt!, ...current].slice(0, 6));
    toast.success(status === "STARTED" ? "Boss stage started." : "Boss progress saved.");
  }

  return (
    <Card className="border-pink-300/20">
      <CardHeader>
        <Badge variant={progress?.status === "COMPLETED" ? "lime" : "pink"}>{progress?.status ?? "not started"}</Badge>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-pink-200" />
          Boss Run Control
        </CardTitle>
        <p className="text-sm leading-6 text-slate-400">
          Start a boss stage, save stage clears, and build a persistent boss history tied to your profile.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <div className="flex justify-between text-sm font-bold text-slate-300">
            <span>Current stage: {stages[currentStage]?.title ?? "Ready"}</span>
            <span>{Math.round(completion)}%</span>
          </div>
          <Progress value={completion} indicatorClassName="bg-arena-pulse" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => save("STARTED")} disabled={busy || progress?.status === "COMPLETED"}>
            <Play className="h-4 w-4" />
            Start Stage
          </Button>
          <Button type="button" variant="secondary" onClick={() => save(currentStage >= stages.length - 1 ? "COMPLETED" : "STAGE_CLEARED")} disabled={busy || progress?.status === "COMPLETED"}>
            <CheckCircle2 className="h-4 w-4" />
            {currentStage >= stages.length - 1 ? "Defeat Boss" : "Clear Stage"}
          </Button>
        </div>
        <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Recent boss events</div>
          {attempts.length === 0 ? (
            <div className="text-sm text-slate-400">No stage attempts saved yet.</div>
          ) : (
            attempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-3 rounded bg-white/6 px-3 py-2 text-sm">
                <span className="text-slate-200">Stage {attempt.stageIndex + 1} / {attempt.status}</span>
                <span className="font-black text-cyan-100">{attempt.score}%</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
