"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { WebGLRenderer } from "three";
import { Activity, ArrowRight, Keyboard, Mic, MonitorUp, Power, Send, Sparkles, TerminalSquare, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GeniePanel } from "@/components/genie/genie-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { runSafeMockJudge } from "@/lib/game/challenge-engine";
import type { GeneratedChallenge } from "@/lib/game/types";
import { parseVoiceCommand } from "@/lib/voice/commands";
import { detectWebXRSupport, type WebXRSupportResult } from "@/lib/vr/support";

const VRRoomScene = dynamic(() => import("@/components/vr/vr-room-scene").then((module) => module.VRRoomScene), {
  ssr: false,
  loading: () => (
    <div className="grid h-[620px] place-items-center bg-slate-950 text-center">
      <div>
        <div className="mx-auto h-12 w-12 animate-pulse rounded-md border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.22)]" />
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100">Booting immersive renderer</p>
      </div>
    </div>
  )
});

type XRNavigator = Navigator & {
  xr?: {
    isSessionSupported: (mode: "immersive-vr") => Promise<boolean>;
    requestSession: (mode: "immersive-vr", options?: Record<string, unknown>) => Promise<XRSession>;
  };
};

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type JudgeResult = {
  status: "PASSED" | "FAILED" | "PARTIAL";
  score: number;
  runtime: number;
  memory: number;
  reward?: { xp: number; coins: number };
  testResults: Array<{ name: string; passed: boolean; message: string; expected?: string; actual?: string }>;
};

type VRProgress = {
  rank: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  levelProgress: number;
  completed: number;
};

function isJudgeResult(data: JudgeResult | { error?: string } | null): data is JudgeResult {
  return Boolean(data && "status" in data && "testResults" in data);
}

function typeSpecificPlaceholder(challenge?: GeneratedChallenge) {
  if (!challenge) return "Load a mission, then speak or type an answer here.";
  if (challenge.type === "SQL") return "Write a read-only SQL query with deterministic ordering.";
  if (challenge.type === "LINUX" || challenge.type === "BASH_SCRIPTING") return "Type the safe command pipeline you would run in the simulated lab.";
  if (challenge.type === "GIT_WORKFLOW") return "Describe the Git commands and final repository state.";
  if (challenge.type === "MULTIPLE_CHOICE" || challenge.type === "SYSTEM_DESIGN_MINI") return "Choose an option and justify it clearly.";
  return "Write your solution, trace, or explanation here.";
}

export function VRExperience({
  challenge,
  nextSlug,
  progress
}: {
  challenge?: GeneratedChallenge;
  nextSlug?: string;
  progress: VRProgress;
}) {
  const router = useRouter();
  const [renderer, setRenderer] = useState<WebGLRenderer | null>(null);
  const [support, setSupport] = useState<WebXRSupportResult>({
    checked: false,
    webxrSupported: false,
    mode: "fallback-3d",
    reason: "Checking WebXR support...",
    actionLabel: "Checking VR Mode",
    statusLabel: "Checking"
  });
  const immersiveRootRef = useRef<HTMLDivElement>(null);
  const voiceSupportedRef = useRef(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("Voice command stream ready");
  const [roomState, setRoomState] = useState("Challenge board focused");
  const [commandLog, setCommandLog] = useState<string[]>([
    "Say: Read the problem",
    "Say: Give me a hint",
    "Say: Run tests"
  ]);
  const [answer, setAnswer] = useState(challenge?.starterCode ?? "");
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [loading, setLoading] = useState<"run" | "submit" | "hint" | "genie" | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [latestHint, setLatestHint] = useState<string | null>(null);
  const [genieLine, setGenieLine] = useState("Genie is in VR voice mode. Ask for a short hint, error explanation, or progress readout.");
  const [manualCommand, setManualCommand] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [browserImmersive, setBrowserImmersive] = useState(false);

  const failedTests = useMemo(() => result?.testResults.filter((test) => !test.passed) ?? [], [result]);
  const answerPreview = answer.trim() || typeSpecificPlaceholder(challenge);

  useEffect(() => {
    setAnswer(challenge?.starterCode ?? "");
    setResult(null);
    setHintIndex(0);
    setLatestHint(null);
    setAttempts(0);
    setHintsUsed(0);
    setRoomState("Challenge board focused");
  }, [challenge?.slug, challenge?.starterCode]);

  const recordVRSession = useCallback((mode: "webxr" | "fallback-3d", metadata: Record<string, unknown> = {}) => {
    void fetch("/api/vr/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        voiceEnabled: voiceSupportedRef.current,
        challengeSlug: challenge?.slug,
        metadata: { source: "vr-page", challengeType: challenge?.type, ...metadata }
      })
    }).catch(() => null);
  }, [challenge?.slug, challenge?.type]);

  useEffect(() => {
    let cancelled = false;

    async function bootImmersiveMode() {
      const detected = await detectWebXRSupport(typeof navigator === "undefined" ? null : (navigator as XRNavigator));
      if (cancelled) return;
      setSupport(detected);
      setRoomState(detected.webxrSupported ? "Headset entry available; browser room is already live" : "Browser immersive room active");
      recordVRSession(detected.mode, { headsetSupported: detected.webxrSupported, reason: detected.reason });
    }

    const voiceReady =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    voiceSupportedRef.current = voiceReady;
    setVoiceSupported(voiceReady);
    void bootImmersiveMode();
    return () => {
      cancelled = true;
    };
  }, [recordVRSession]);

  useEffect(() => {
    function syncFullscreenState() {
      setBrowserImmersive(Boolean(document.fullscreenElement));
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  function logCommand(command: string) {
    setCommandLog((current) => [command, ...current].slice(0, 6));
    setVoiceCommand(command);
  }

  function speak(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Speech synthesis is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function progressReadout() {
    return `Level ${progress.level}, ${progress.rank}. ${progress.levelProgress}% toward the next level. ${progress.streak} day streak. ${progress.xp} XP and ${progress.coins} coins.`;
  }

  async function enterBrowserImmersive(reason = "Browser immersive room active.") {
    setBrowserImmersive(true);
    setRoomState(reason);
    recordVRSession("fallback-3d", { source: "browser-immersive-entry", fullscreenRequested: true });

    const root = immersiveRootRef.current;
    if (!root || typeof root.requestFullscreen !== "function" || document.fullscreenElement) {
      toast.success(reason);
      return;
    }

    try {
      await root.requestFullscreen({ navigationUI: "hide" } as FullscreenOptions);
      toast.success("Browser immersive mode is now fullscreen.");
    } catch {
      toast.message("Browser immersive mode is active. Fullscreen was blocked by the browser, so the arena stays in-page.");
    }
  }

  async function leaveBrowserImmersive() {
    setBrowserImmersive(false);
    setRoomState("Challenge board focused");
    if (typeof document !== "undefined" && document.fullscreenElement) {
      await document.exitFullscreen().catch(() => null);
    }
  }

  async function enterVR() {
    const xr = (navigator as XRNavigator).xr;
    if (!xr || !renderer || !support.webxrSupported) {
      await enterBrowserImmersive("Headset VR is unavailable here; browser immersive mode is active.");
      return;
    }

    try {
      const session = await xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "bounded-floor"] });
      renderer.xr.enabled = true;
      await renderer.xr.setSession(session);
      setRoomState("Headset session active");
      recordVRSession("webxr", { source: "headset-entry" });
    } catch {
      await enterBrowserImmersive("The browser refused headset entry; browser immersive mode is active.");
    }
  }

  async function runJudge(mode: "run" | "submit") {
    if (!challenge) {
      toast.error("Load a challenge before running checks.");
      return;
    }

    setLoading(mode);
    setRoomState(mode === "run" ? "Running visible checks..." : "Submitting answer...");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    let data: JudgeResult | { error?: string } | null = null;
    let responseOk = false;

    try {
      const response = await fetch(`/api/challenges/${challenge.slug}/${mode === "run" ? "run" : "submit"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, mode }),
        signal: controller.signal
      });
      responseOk = response.ok;
      data = (await response.json().catch(() => null)) as JudgeResult | { error?: string } | null;
    } catch {
      data = await runSafeMockJudge({ challenge, answer, mode });
      responseOk = true;
      toast.message("Network judge was slow, so VR used the local safe fallback.");
    } finally {
      window.clearTimeout(timeout);
    }
    setLoading(null);

    if (!responseOk || !isJudgeResult(data)) {
      const message = (data && "error" in data && data.error) || "Judge request failed.";
      setRoomState(message);
      toast.error(message);
      speak(message);
      return;
    }

    setAttempts((current) => current + 1);
    setResult(data);
    const passed = data.testResults.filter((test) => test.passed).length;
    const summary = data.status === "PASSED"
      ? `Clear. You passed ${passed} of ${data.testResults.length} checks.`
      : `You passed ${passed} of ${data.testResults.length} checks. Score ${data.score}%. Ask Genie to explain the first failed test.`;
    setRoomState(summary);
    setGenieLine(summary);
    speak(summary);
  }

  async function requestHint() {
    if (!challenge) return;
    setLoading("hint");
    const response = await fetch(`/api/challenges/${challenge.slug}/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hintIndex })
    });
    const data = (await response.json().catch(() => null)) as { hint?: string; total?: number; error?: string } | null;
    setLoading(null);

    if (!response.ok || !data?.hint) {
      const message = data?.error ?? "Hint request failed.";
      toast.error(message);
      return;
    }

    setLatestHint(data.hint);
    setHintsUsed((current) => current + 1);
    setHintIndex((current) => Math.min(current + 1, (data.total ?? challenge.hints.length) - 1));
    const spoken = `Hint ${hintIndex + 1}: ${data.hint}`;
    setRoomState("Genie delivered a spoken hint");
    setGenieLine(spoken);
    speak(spoken);
  }

  async function askGenie(message: string, mode: "vr" | "debugging" | "motivation" = "vr") {
    setLoading("genie");
    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode,
        challengeSlug: challenge?.slug,
        currentCode: answer,
        failedTests,
        attempts,
        hintUsage: hintsUsed,
        voice: true,
        completed: result?.status === "PASSED"
      })
    });
    const data = (await response.json().catch(() => null)) as { content?: string; error?: string } | null;
    setLoading(null);
    const content = response.ok ? data?.content ?? "Genie could not answer right now." : data?.error ?? "Genie could not answer right now.";
    setGenieLine(content);
    setRoomState("Genie voice response ready");
    speak(content);
  }

  function handleCommand(command: string) {
    const parsed = parseVoiceCommand(command);
    logCommand(command);

    if (parsed.type === "READ_PROBLEM") {
      const text = challenge
        ? `${challenge.title}. ${challenge.instructions}`
        : "Gencode immersive mode active. Pick a mission to load the challenge board.";
      setRoomState("Reading problem aloud");
      speak(text);
      return;
    }

    if (parsed.type === "GIVE_HINT") {
      void requestHint();
      return;
    }

    if (parsed.type === "EXPLAIN_ERROR") {
      void askGenie("Explain my latest failed test in short VR-friendly language.", "debugging");
      return;
    }

    if (parsed.type === "RUN_TESTS") {
      void runJudge("run");
      return;
    }

    if (parsed.type === "SUBMIT") {
      void runJudge("submit");
      return;
    }

    if (parsed.type === "SHOW_PROGRESS") {
      const readout = progressReadout();
      setRoomState(readout);
      speak(readout);
      return;
    }

    if (parsed.type === "STOP_SPEAKING") {
      stopSpeaking();
      setRoomState("Genie voice stopped");
      return;
    }

    if (parsed.type === "SWITCH_MODE") {
      setRoomState(`Genie ${parsed.mode} voice context armed`);
      void askGenie(`Switch to ${parsed.mode} mode and confirm in one short sentence.`, parsed.mode === "motivation" ? "motivation" : "vr");
      return;
    }

    if (parsed.type === "ENTER_VR") {
      void enterVR();
      return;
    }

    if (parsed.type === "NEXT_CHALLENGE") {
      router.push(nextSlug ? `/vr/${nextSlug}` : "/challenges");
      return;
    }

    if (parsed.type === "SHOW_DASHBOARD" || parsed.type === "EXIT_VR") {
      router.push("/dashboard");
      return;
    }

    setRoomState("Command heard. Try read problem, hint, run tests, submit, progress, dashboard, or exit.");
  }

  function listenForCommand() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice commands are not available in this browser. Keyboard command fallback is active.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onend = () => setRoomState((current) => current === "Listening for voice command..." ? "Voice command stream ready" : current);
    recognition.onresult = (event) => {
      const command = event.results[0]?.[0]?.transcript ?? "";
      handleCommand(command);
    };
    setRoomState("Listening for voice command...");
    recognition.start();
  }

  return (
    <div
      ref={immersiveRootRef}
      className={`immersive-shell grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px] ${browserImmersive ? "is-browser-immersive" : ""}`}
    >
      <div className="grid gap-6">
        <div className="holo-panel overflow-hidden rounded-lg shadow-[0_24px_90px_rgba(34,211,238,0.16)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/6 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={support.webxrSupported ? "lime" : "gold"}>{support.statusLabel}</Badge>
              <Badge variant={voiceSupported ? "cyan" : "slate"}>{voiceSupported ? "voice input ready" : "keyboard fallback"}</Badge>
              <Badge variant="slate">{challenge?.type.replaceAll("_", " ") ?? "mission loader"}</Badge>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={challenge ? `/challenges/${challenge.slug}` : "/challenges"}>Open classic workspace</Link>
            </Button>
          </div>
          <div className="h-[620px]" data-testid="immersive-scene">
            <VRRoomScene
              challenge={challenge}
              xrSupported={support.webxrSupported}
              roomState={roomState}
              answerPreview={answerPreview}
              score={result?.score}
              rank={progress.rank}
              level={progress.level}
              levelProgress={progress.levelProgress}
              streak={progress.streak}
              voiceCommand={voiceCommand}
              onRenderer={setRenderer}
            />
          </div>
        </div>

        <Card className="border-cyan-300/20 bg-cyan-300/8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-cyan-200" />
              Immersive Answer Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Textarea
              aria-label="Immersive answer stream"
              className="min-h-44 font-mono"
              placeholder={typeSpecificPlaceholder(challenge)}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => runJudge("run")} disabled={loading !== null || !challenge}>
                <Activity className="h-4 w-4" />
                {loading === "run" ? "Running..." : "Run Tests"}
              </Button>
              <Button type="button" variant="gold" onClick={() => runJudge("submit")} disabled={loading !== null || !challenge}>
                <Send className="h-4 w-4" />
                {loading === "submit" ? "Submitting..." : "Submit Answer"}
              </Button>
              <Button type="button" variant="secondary" onClick={requestHint} disabled={loading !== null || !challenge}>
                <Sparkles className="h-4 w-4" />
                {loading === "hint" ? "Fetching..." : "Voice Hint"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid content-start gap-6 xl:sticky xl:top-24">
        <Card className="border-cyan-300/20">
          <CardHeader>
            <Badge variant={support.webxrSupported ? "lime" : "gold"}>{support.statusLabel}</Badge>
            <CardTitle>Immersive Control Deck</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button type="button" onClick={enterVR}>
              <MonitorUp className="h-4 w-4" />
              {support.actionLabel}
            </Button>
            <Button type="button" variant="secondary" onClick={leaveBrowserImmersive} disabled={!browserImmersive}>
              <Power className="h-4 w-4" />
              Leave Browser Immersive
            </Button>
            <Button type="button" variant="secondary" onClick={listenForCommand}>
              <Mic className="h-4 w-4" />
              Voice Command
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleCommand("read the problem")}>
              <Volume2 className="h-4 w-4" />
              Read Problem
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleCommand("show my progress")}>
              <Activity className="h-4 w-4" />
              Show Progress
            </Button>
            <Button type="button" variant="secondary" onClick={stopSpeaking}>
              <VolumeX className="h-4 w-4" />
              Stop Speaking
            </Button>
            <Button type="button" variant="danger" onClick={() => router.push("/dashboard")}>
              <Power className="h-4 w-4" />
              Exit VR
            </Button>
            <div className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-slate-300">
              <div className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-500">Support status</div>
              <div className="font-semibold text-cyan-100">{support.reason}</div>
              <div className="mt-2 text-slate-400">{roomState}</div>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Input
                  aria-label="Keyboard voice command fallback"
                  value={manualCommand}
                  onChange={(event) => setManualCommand(event.target.value)}
                  placeholder="Type a voice command fallback..."
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    handleCommand(manualCommand);
                    setManualCommand("");
                  }}
                  aria-label="Run typed command"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-2 rounded-md border border-white/10 bg-white/6 p-3">
                {commandLog.map((entry, index) => (
                  <div key={`${entry}-${index}`} className="text-xs text-slate-300">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rank Signal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Level {progress.level}</span>
              <span className="font-black text-white">{progress.rank}</span>
            </div>
            <Progress value={progress.levelProgress} />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="stat-tile rounded-md p-2">
                <div className="text-lg font-black text-white">{progress.xp}</div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">XP</div>
              </div>
              <div className="stat-tile rounded-md p-2">
                <div className="text-lg font-black text-yellow-100">{progress.coins}</div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Coins</div>
              </div>
              <div className="stat-tile rounded-md p-2">
                <div className="text-lg font-black text-lime-100">{progress.streak}</div>
                <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Checks</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {!result ? (
              <p className="text-sm text-slate-400">Run tests from the control deck or say “Run tests” to populate this panel.</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant={result.status === "PASSED" ? "lime" : result.status === "PARTIAL" ? "gold" : "red"}>{result.status}</Badge>
                  <span className="text-sm font-bold text-slate-300">{result.score}% / {result.runtime}ms</span>
                </div>
                <div className="grid gap-2">
                  {result.testResults.slice(0, 4).map((test) => (
                    <div key={test.name} className="rounded-md border border-white/10 bg-white/6 p-2 text-xs text-slate-300">
                      <div className={test.passed ? "font-bold text-lime-100" : "font-bold text-red-100"}>{test.name}</div>
                      <div>{test.message}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {latestHint ? (
              <div className="rounded-md border border-yellow-300/20 bg-yellow-300/10 p-3 text-sm text-yellow-50">
                {latestHint}
              </div>
            ) : null}
            <div className="rounded-md border border-cyan-300/15 bg-cyan-300/8 p-3 text-sm leading-6 text-cyan-50">
              {genieLine}
            </div>
            {nextSlug ? (
              <Button asChild variant="secondary">
                <Link href={`/vr/${nextSlug}`}>
                  Open Next Challenge
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <GeniePanel
          mode="vr"
          challengeSlug={challenge?.slug}
          currentCode={answer}
          failedTests={failedTests}
          attempts={attempts}
          hintUsage={hintsUsed}
          completed={result?.status === "PASSED"}
          onRunTests={() => runJudge("run")}
          onSubmit={() => runJudge("submit")}
        />
      </div>
    </div>
  );
}
