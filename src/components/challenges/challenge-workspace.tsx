"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, Flame, Lightbulb, Lock, MonitorUp, Play, RotateCcw, Send, TerminalSquare, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GeniePanel } from "@/components/genie/genie-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CompletionCard } from "@/components/progression/completion-card";
import type { GeneratedChallenge } from "@/lib/game/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="grid h-96 place-items-center bg-slate-950 text-center text-slate-400">
      <div>
        <div className="mx-auto h-10 w-10 animate-pulse rounded-md border border-cyan-300/30 bg-cyan-300/10 shadow-neon" />
        <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Charging editor core</p>
      </div>
    </div>
  )
});

type JudgeResult = {
  status: "PASSED" | "FAILED" | "PARTIAL";
  score: number;
  runtime: number;
  memory: number;
  reward?: { xp: number; coins: number };
  testResults: Array<{ name: string; passed: boolean; message: string; expected?: string; actual?: string }>;
};

function isJudgeResult(data: JudgeResult | { error?: string } | null): data is JudgeResult {
  return Boolean(data && "status" in data && "testResults" in data);
}

function TerminalPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<{ dispose: () => void; write: (data: string) => void } | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;
    async function boot() {
      const [{ Terminal }, { FitAddon }] = await Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")]);
      if (!mounted || !ref.current) return;
      const terminal = new Terminal({
        cursorBlink: true,
        theme: {
          background: "#020617",
          foreground: "#dbeafe",
          cursor: "#60f3ff"
        },
        fontFamily: "Menlo, Monaco, Consolas, monospace",
        fontSize: 13
      });
      const fit = new FitAddon();
      terminal.loadAddon(fit);
      terminal.open(ref.current);
      fit.fit();
      const initialValue = initialValueRef.current;
      terminal.write(initialValue.replace(/\n/g, "\r\n"));
      terminal.write(initialValue.endsWith("\n") ? "$ " : "\r\n$ ");
      let buffer = initialValue;
      terminal.onData((data) => {
        if (data === "\r") {
          terminal.write("\r\n$ ");
          buffer += "\n";
        } else if (data === "\u007f") {
          buffer = buffer.slice(0, -1);
          terminal.write("\b \b");
        } else {
          buffer += data;
          terminal.write(data);
        }
        onChangeRef.current(buffer);
      });
      terminalRef.current = terminal;
    }
    void boot();
    return () => {
      mounted = false;
      terminalRef.current?.dispose();
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-md border border-cyan-300/20 bg-slate-950 shadow-[0_18px_70px_rgba(0,0,0,0.42)]">
      <div className="flex items-center justify-between border-b border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
        <span>Simulated secure terminal</span>
        <span>host isolated</span>
      </div>
      <div ref={ref} className="h-96 overflow-hidden p-2" />
    </div>
  );
}

function StructureVisualizer() {
  const nodes = useMemo(() => ["root", "left", "right", "leaf A", "leaf B"], []);
  return (
    <div className="grid h-96 place-items-center rounded-md border border-white/10 bg-slate-950/80 p-6">
      <div className="grid gap-5 text-center">
        <div className="mx-auto rounded-md border border-cyan-300/50 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-100">
          {nodes[0]}
        </div>
        <div className="grid grid-cols-2 gap-10">
          {nodes.slice(1, 3).map((node) => (
            <div key={node} className="rounded-md border border-yellow-300/40 bg-yellow-300/10 px-5 py-3 text-sm font-bold text-yellow-100">
              {node}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-10">
          {nodes.slice(3).map((node) => (
            <div key={node} className="rounded-md border border-lime-300/40 bg-lime-300/10 px-5 py-3 text-sm font-bold text-lime-100">
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ChallengeWorkspace({
  challenge,
  previousSlug,
  nextSlug,
  related = [],
  locked = false,
  lockReason,
  upgradeHref,
  missingPrerequisites = []
}: {
  challenge: GeneratedChallenge;
  previousSlug?: string;
  nextSlug?: string;
  related?: GeneratedChallenge[];
  locked?: boolean;
  lockReason?: string;
  upgradeHref?: string;
  missingPrerequisites?: string[];
}) {
  const [answer, setAnswer] = useState(challenge.starterCode ?? "");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loading, setLoading] = useState<"run" | "submit" | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const cleared = result?.status === "PASSED";
  const isConceptAnswer =
    challenge.type === "MULTIPLE_CHOICE" || challenge.type === "SYSTEM_DESIGN_MINI" || challenge.type === "OUTPUT_PREDICTION" || challenge.type === "BOSS_STAGE";
  const isTerminalAnswer =
    challenge.type === "LINUX" || challenge.type === "BASH_SCRIPTING" || challenge.type === "GIT_WORKFLOW";
  const editorHeading =
    challenge.type === "SQL"
      ? "SQL query console"
      : isTerminalAnswer
        ? "Terminal lab"
        : challenge.type === "DATA_STRUCTURE_VISUALIZATION"
          ? "Structure lab"
          : isConceptAnswer
            ? "Reasoning panel"
          : "Code editor";
  const clearedReward = result?.reward
    ? `${result.reward.xp} XP + ${result.reward.coins} coins`
    : `${challenge.xpReward} XP + ${challenge.coinReward} coins`;

  function resetWorkspace() {
    setAnswer(challenge.starterCode ?? "");
    setResult(null);
    setRevealedHints([]);
    setHintIndex(0);
    setAttemptCount(0);
    setWorkspaceVersion((current) => current + 1);
    toast.message("Workspace reset to the starter state.");
  }

  async function judge(mode: "run" | "submit") {
    if (locked) {
      toast.error(lockReason ?? "This mission is locked.");
      return;
    }
    setLoading(mode);
    const response = await fetch(`/api/challenges/${challenge.slug}/${mode === "run" ? "run" : "submit"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer, mode })
    });
    const data = (await response.json().catch(() => null)) as JudgeResult | { error?: string } | null;
    setLoading(null);
    if (!response.ok || !isJudgeResult(data)) {
      toast.error((data && "error" in data && data.error) || "Judge request failed.");
      return;
    }
    setAttemptCount((current) => current + 1);
    setResult(data);
    if (data.status === "PASSED") toast.success(mode === "submit" ? "Challenge cleared. Rewards granted." : "Visible checks passed.");
    else toast.message("Tests returned feedback. Tighten the edge cases.");
  }

  async function revealHint() {
    if (locked) {
      toast.error("Hints unlock with the mission.");
      return;
    }
    const response = await fetch(`/api/challenges/${challenge.slug}/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintIndex })
    });
    const data = (await response.json().catch(() => null)) as { hint?: string; total?: number; error?: string } | null;
    if (!response.ok) {
      toast.error(data?.error ?? "Hint request failed.");
      return;
    }
    if (data?.hint) {
      setRevealedHints((current) => [...current, data.hint!]);
      setHintIndex((current) => Math.min(current + 1, (data.total ?? challenge.hints.length) - 1));
    }
  }

  const editor = isTerminalAnswer ? (
    <TerminalPanel key={`${challenge.slug}-${workspaceVersion}`} value={answer} onChange={setAnswer} />
  ) : isConceptAnswer ? (
    <Textarea className="min-h-96 font-mono" value={answer} onChange={(event) => setAnswer(event.target.value)} />
  ) : challenge.type === "DATA_STRUCTURE_VISUALIZATION" ? (
    <div className="grid gap-4">
      <StructureVisualizer />
      <Textarea className="font-mono" value={answer} onChange={(event) => setAnswer(event.target.value)} />
    </div>
  ) : (
    <div className="overflow-hidden rounded-md border border-white/10">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/6 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
        <span>{challenge.language ?? "editor"}</span>
        <span>safe mock judge</span>
      </div>
      <MonacoEditor
        height="430px"
        theme="vs-dark"
        language={challenge.language ?? "python"}
        value={answer}
        onChange={(value) => setAnswer(value ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          wordWrap: "on"
        }}
      />
    </div>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="grid gap-6">
        <Card className="holo-panel">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan">{challenge.categorySlug}</Badge>
              <Badge variant="gold">{challenge.difficulty}</Badge>
              <Badge variant="slate">{challenge.type.replaceAll("_", " ")}</Badge>
            </div>
            <CardTitle className="text-3xl sm:text-4xl">{challenge.title}</CardTitle>
            <p className="text-sm leading-6 text-slate-400">{challenge.subtitle}</p>
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">XP reward</div>
                <div className="mt-1 text-2xl font-black text-white">{challenge.xpReward}</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Coins</div>
                <div className="mt-1 text-2xl font-black text-yellow-100">{challenge.coinReward}</div>
              </div>
              <div className="stat-tile rounded-md p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Target time</div>
                <div className="mt-1 text-2xl font-black text-cyan-100">{challenge.estimatedTime}m</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5">
            {cleared ? (
              <div className="grid gap-4">
                <CompletionCard
                  title={`${challenge.title} cleared`}
                  subtitle="Visible and hidden robustness checks accepted. This clear now feeds rank progress, quest momentum, category mastery, and your shareable operator story."
                  reward={clearedReward}
                />
                <div className="rounded-lg border border-lime-300/25 bg-lime-300/10 p-4">
                  <div className="flex items-center gap-2 text-lg font-black text-white">
                    <Flame className="h-5 w-5 text-lime-200" />
                    Clear locked in. Do not stop at the confetti.
                  </div>
                  <p className="mt-2 text-sm leading-6 text-lime-50">
                    Ask Genie to review the edge case, queue the next mission, or open your profile to see how this clear changes your public mastery signal.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                      <Link href={nextSlug ? `/challenges/${nextSlug}` : "/challenges"}>
                        Queue next mission
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/profile">
                        View profile signal
                      </Link>
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => toast.message("Ask Genie: Review my clear and give me tomorrow's next rep.")}>
                      <BrainCircuit className="h-4 w-4" />
                      Genie review prompt
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
            {locked ? (
              <div className="rounded-md border border-yellow-300/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-50">
                <div className="flex items-center gap-2 font-black text-yellow-100">
                  <Lock className="h-4 w-4" />
                  Mission locked
                </div>
                <p className="mt-1">{lockReason ?? "Clear prerequisite missions before attempting this challenge."}</p>
                {missingPrerequisites.length > 0 ? (
                  <p className="mt-1 text-yellow-100">Missing prerequisites: {missingPrerequisites.join(", ")}</p>
                ) : null}
                {upgradeHref ? (
                  <Button asChild className="mt-3" size="sm" variant="gold">
                    <Link href={upgradeHref}>Upgrade to unlock</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
            <p className="text-base leading-7 text-slate-300">{challenge.story}</p>
            <div className="rounded-md border border-lime-300/20 bg-lime-300/8 p-4">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-lime-100">Learning objective</div>
              <p className="mt-2 text-sm leading-6 text-lime-50">{challenge.learningObjective}</p>
            </div>
            <div className="rounded-md border border-cyan-300/20 bg-cyan-300/8 p-4 text-sm leading-6 text-cyan-50">
              <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-100">Mission order</div>
              {challenge.instructions}
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="mb-2 text-sm font-bold text-white">Visible checks</div>
                <div className="grid gap-2 text-xs leading-5 text-slate-300">
                  {(challenge.examples.length ? challenge.examples : challenge.testCases.slice(0, 2)).map((example) => (
                    <div key={example.name} className="rounded bg-white/6 p-2">
                      <div className="font-semibold text-cyan-100">{example.name}</div>
                      <div>Expected: {String(example.expected ?? "valid behavior")}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-black/20 p-4">
                <div className="mb-2 text-sm font-bold text-white">Clear requirements</div>
                <ul className="grid gap-2 text-xs leading-5 text-slate-300">
                  {challenge.successCriteria.map((criterion) => (
                    <li key={criterion} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lime-300" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid gap-3 rounded-md border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-bold text-white">Secure validation contract</div>
              <div className="grid gap-2 text-xs leading-5 text-slate-300 md:grid-cols-2">
                <div className="rounded bg-white/6 p-3">
                  <div className="font-semibold text-cyan-100">Judge type</div>
                  <div>{challenge.validationMetadata.kind.replaceAll("_", " ")}</div>
                </div>
                <div className="rounded bg-white/6 p-3">
                  <div className="font-semibold text-cyan-100">Complexity target</div>
                  <div>{challenge.validationMetadata.complexityTarget ?? "Correct, deterministic, and explainable."}</div>
                </div>
                {challenge.validationMetadata.sql ? (
                  <div className="rounded bg-white/6 p-3 md:col-span-2">
                    <div className="font-semibold text-yellow-100">SQL schema</div>
                    <div>{challenge.validationMetadata.sql.schema}</div>
                  </div>
                ) : null}
                {challenge.validationMetadata.linux ? (
                  <div className="rounded bg-white/6 p-3 md:col-span-2">
                    <div className="font-semibold text-yellow-100">Simulated lab</div>
                    <div>{challenge.validationMetadata.linux.simulatedFilesystem.length} files/directories, allowed commands: {challenge.validationMetadata.linux.allowedCommands.slice(0, 8).join(", ")}</div>
                  </div>
                ) : null}
                {challenge.validationMetadata.git ? (
                  <div className="rounded bg-white/6 p-3 md:col-span-2">
                    <div className="font-semibold text-yellow-100">Git final state</div>
                    <div>{challenge.validationMetadata.git.requiredFinalState}</div>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Workspace</div>
                <div className="mt-1 font-black text-white">{editorHeading}</div>
              </div>
              <Badge variant={locked ? "gold" : "lime"}>{locked ? "locked" : "ready"}</Badge>
            </div>
            {locked ? (
              <div className="grid min-h-72 place-items-center rounded-md border border-white/10 bg-slate-950/80 p-8 text-center">
                <div>
                  <Lock className="mx-auto h-10 w-10 text-yellow-200" />
                  <h2 className="mt-4 text-xl font-black text-white">Clear the route first</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                    You can read the mission brief, but the editor, hints, tests, and submit flow stay locked until progression or plan access catches up.
                  </p>
                  {upgradeHref ? (
                    <Button asChild className="mt-4" variant="gold">
                      <Link href={upgradeHref}>View upgrade path</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : editor}
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => judge("run")} disabled={loading !== null || locked}>
                <Play className="h-4 w-4" />
                {loading === "run" ? "Running..." : "Run Tests"}
              </Button>
              <Button type="button" variant="gold" onClick={() => judge("submit")} disabled={loading !== null || locked}>
                <Send className="h-4 w-4" />
                {loading === "submit" ? "Submitting..." : "Submit"}
              </Button>
              <Button type="button" variant="secondary" onClick={revealHint} disabled={locked}>
                <Lightbulb className="h-4 w-4" />
                Hint
              </Button>
              <Button type="button" variant="secondary" onClick={resetWorkspace}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/vr/${challenge.slug}`}>
                  <MonitorUp className="h-4 w-4" />
                  Enter Immersive
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={cleared ? "completion-burst border-lime-300/30" : undefined}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-arena-glow" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!result ? (
              <p className="text-sm text-slate-400">Run the visible checks when your first pass is ready.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={result.status === "PASSED" ? "lime" : result.status === "PARTIAL" ? "gold" : "red"}>
                    {result.status}
                  </Badge>
                  <span className="text-sm font-semibold text-slate-300">Score {result.score}%</span>
                  <span className="text-sm text-slate-500">{result.runtime} ms / {result.memory} MB</span>
                  {result.reward ? (
                    <span className="flex items-center gap-1 text-sm font-semibold text-yellow-100">
                      <Trophy className="h-4 w-4" />
                      +{result.reward.xp} XP, +{result.reward.coins} coins
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  {result.testResults.map((test) => (
                    <div key={test.name} className="rounded-md border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <CheckCircle2 className={test.passed ? "h-4 w-4 text-lime-300" : "h-4 w-4 text-red-300"} />
                        {test.name}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{test.message}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6 xl:sticky xl:top-24">
        <Card className="border-cyan-300/20 bg-cyan-300/8">
          <CardHeader>
            <CardTitle>Clear Protocol</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-6 text-cyan-50">
            {[
              "Read the scenario and restate the expected output shape.",
              "Run visible checks before chasing hidden edge cases.",
              "Use Genie for one nudge if stuck, then explain the invariant.",
              "Submit only when the result is deterministic and safe."
            ].map((step, index) => (
              <div key={step} className="flex gap-3 rounded-md border border-white/10 bg-black/20 p-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-cyan-300/15 text-xs font-black text-cyan-100">{index + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md bg-white/8 p-3">
              <div className="text-slate-400">XP</div>
              <div className="text-2xl font-black text-white">{challenge.xpReward}</div>
            </div>
            <div className="rounded-md bg-white/8 p-3">
              <div className="text-slate-400">Coins</div>
              <div className="text-2xl font-black text-yellow-100">{challenge.coinReward}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mission Route</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="secondary" className={!previousSlug ? "pointer-events-none opacity-50" : undefined}>
                <Link href={previousSlug ? `/challenges/${previousSlug}` : "/challenges"} aria-disabled={!previousSlug}>
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Link>
              </Button>
              <Button asChild variant="secondary" className={!nextSlug ? "pointer-events-none opacity-50" : undefined}>
                <Link href={nextSlug ? `/challenges/${nextSlug}` : "/challenges"} aria-disabled={!nextSlug}>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Button asChild>
              <Link href="/challenges">Back to catalog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hints</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {revealedHints.length === 0 ? (
              <p className="text-sm text-slate-400">Hints are metered and logged for No Hint Hero runs.</p>
            ) : (
              revealedHints.map((hint, index) => (
                <div key={`${hint}-${index}`} className="rounded-md border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm text-yellow-50">
                  {hint}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <GeniePanel
          challengeSlug={challenge.slug}
          compact
          mode="hint"
          currentCode={answer}
          failedTests={result?.testResults.filter((test) => !test.passed) ?? []}
          attempts={attemptCount}
          hintUsage={revealedHints.length}
          completed={cleared}
          onRunTests={() => judge("run")}
          onSubmit={() => judge("submit")}
        />

        {related.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Related Missions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {related.map((item) => (
                <Link key={item.slug} href={`/challenges/${item.slug}`} className="rounded-md border border-white/10 bg-white/6 p-3 transition hover:border-cyan-300/40">
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{item.difficulty} / {item.xpReward} XP</div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
