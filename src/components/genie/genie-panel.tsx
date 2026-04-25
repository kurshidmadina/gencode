"use client";

import { Bot, BrainCircuit, Bug, Code2, Database, Lightbulb, MessageSquareText, Mic, Send, ShieldCheck, Sparkles, SquareTerminal, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { assistantModeLabels, type AssistantMode } from "@/lib/assistant/modes";
import { parseVoiceCommand } from "@/lib/voice/commands";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type FailedTest = {
  name: string;
  passed?: boolean;
  message?: string;
  expected?: string;
  actual?: string;
};

type SpeechRecognitionConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type GeniePanelProps = {
  challengeSlug?: string;
  compact?: boolean;
  mode?: AssistantMode;
  currentCode?: string;
  failedTests?: FailedTest[];
  attempts?: number;
  hintUsage?: number;
  completed?: boolean;
  onRunTests?: () => void | Promise<void>;
  onSubmit?: () => void | Promise<void>;
};

const visibleModes: AssistantMode[] = [
  "mentor",
  "hint",
  "debugging",
  "interviewer",
  "socratic",
  "explain",
  "code-review",
  "sql-review",
  "linux-coach",
  "motivation",
  "vr"
];

const modeIcon: Partial<Record<AssistantMode, typeof BrainCircuit>> = {
  mentor: BrainCircuit,
  hint: Lightbulb,
  debugging: Bug,
  interviewer: MessageSquareText,
  socratic: Sparkles,
  explain: Bot,
  "code-review": Code2,
  "sql-review": Database,
  "linux-coach": SquareTerminal,
  motivation: Sparkles,
  vr: Volume2
};

export function GeniePanel({
  challengeSlug,
  compact = false,
  mode = "mentor",
  currentCode,
  failedTests = [],
  attempts = 0,
  hintUsage = 0,
  completed = false,
  onRunTests,
  onSubmit
}: GeniePanelProps) {
  const [activeMode, setActiveMode] = useState<AssistantMode>(mode);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Genie online. I use your mission, attempts, failed tests, hints, and path context to coach the next rep without dumping answers first."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);
  const [speakResponses, setSpeakResponses] = useState(mode === "vr");
  const [listening, setListening] = useState(false);

  const canUseSpeech = useMemo(() => {
    if (typeof window === "undefined") return false;
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  }, []);

  const suggestions = useMemo(() => {
    const byMode: Record<AssistantMode, string[]> = {
      mentor: ["Make me a 3-step plan", "What should I test first?", "What edge case matters?"],
      hint: [`Give me a level ${hintLevel} hint`, "Nudge me without code", "What invariant should I track?"],
      debugging: ["Explain my failed test", "What input breaks this?", "Help me isolate the bug"],
      interviewer: ["Ask a follow-up", "Challenge my complexity", "What tradeoff did I miss?"],
      socratic: ["Ask the unlocking question", "Make me reason it out", "What should I prove?"],
      explain: ["Explain the core idea", "Show one small example", "Compare two approaches"],
      concept: ["Explain the core idea", "Show one small example", "Compare two approaches"],
      "code-review": ["Review my current code", "Find the edge case", "Check complexity"],
      "sql-review": ["Review my SQL shape", "Check join safety", "Check read-only rules"],
      "linux-coach": ["Coach this command", "Is this pipeline safe?", "How do I quote paths?"],
      motivation: ["Give me a reset", "Pick one next rep", "Help me keep momentum"],
      vr: ["Read the problem", "Give me a short voice hint", "Explain this error briefly"],
      coach: ["Pick my next mission", "Help me keep streak", "Turn this into a 10-minute rep"]
    };
    return byMode[activeMode];
  }, [activeMode, hintLevel]);

  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");

  const speak = useCallback(
    (text?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        toast.error("Speech synthesis is not available in this browser.");
        return;
      }
      if (!text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = activeMode === "vr" ? 0.94 : 1;
      window.speechSynthesis.speak(utterance);
    },
    [activeMode]
  );

  useEffect(() => {
    if (!speakResponses || messages.length <= 1) return;
    const latest = messages[messages.length - 1];
    if (latest?.role === "assistant") speak(latest.content);
  }, [messages, speak, speakResponses]);

  async function sendMessage(message = input, overrides?: { mode?: AssistantMode; hintLevel?: number; allowSolution?: boolean }) {
    if (!message.trim()) return;
    const modeForRequest = overrides?.mode ?? activeMode;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);

    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        mode: modeForRequest,
        challengeSlug,
        sessionId,
        hintLevel: overrides?.hintLevel ?? hintLevel,
        currentCode,
        failedTests,
        attempts,
        hintUsage,
        completed,
        allowSolution: overrides?.allowSolution ?? completed,
        voice: speakResponses || modeForRequest === "vr"
      })
    });
    const data = (await response.json().catch(() => null)) as {
      content?: string;
      sessionId?: string;
      error?: string;
      safety?: { fullSolutionWithheld?: boolean; reason?: string };
    } | null;
    setLoading(false);
    if (!response.ok) {
      const content = data?.error ?? "Genie could not answer right now.";
      setMessages((current) => [...current, { role: "assistant", content }]);
      toast.error(content);
      return;
    }
    if (data?.sessionId) setSessionId(data.sessionId);
    const content = data?.content ?? "Genie could not answer right now.";
    setMessages((current) => [...current, { role: "assistant", content }]);
    if (data?.safety?.fullSolutionWithheld) toast.message("Genie kept the answer guarded and gave a learning-safe next step.");
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function handleVoiceTranscript(transcript: string) {
    const parsed = parseVoiceCommand(transcript);
    setInput(transcript);

    if (parsed.type === "STOP_SPEAKING") {
      stopSpeaking();
      toast.message("Genie voice stopped.");
      return;
    }

    if (parsed.type === "READ_PROBLEM") {
      setActiveMode("vr");
      void sendMessage("Read the problem aloud in a short VR-friendly way.", { mode: "vr" });
      return;
    }

    if (parsed.type === "GIVE_HINT") {
      setActiveMode("hint");
      void sendMessage(`Give me a level ${hintLevel} hint.`, { mode: "hint", hintLevel });
      return;
    }

    if (parsed.type === "EXPLAIN_ERROR") {
      setActiveMode("debugging");
      void sendMessage("Explain my latest failed test and the smallest next fix.", { mode: "debugging" });
      return;
    }

    if (parsed.type === "RUN_TESTS") {
      if (onRunTests) {
        void onRunTests();
        setMessages((current) => [...current, { role: "assistant", content: "Running the visible checks. When they return, ask me to explain the first failure." }]);
      } else {
        toast.message("Run tests is available inside a challenge workspace.");
      }
      return;
    }

    if (parsed.type === "SUBMIT") {
      if (onSubmit) {
        void onSubmit();
        setMessages((current) => [...current, { role: "assistant", content: "Submission queued. If it fails, I will help isolate the first divergence." }]);
      } else {
        toast.message("Submit is available inside a challenge workspace.");
      }
      return;
    }

    if (parsed.type === "SWITCH_MODE") {
      setActiveMode(parsed.mode);
      toast.message(`Genie switched to ${assistantModeLabels[parsed.mode]} mode.`);
      return;
    }

    void sendMessage(transcript);
  }

  function listen() {
    if (!canUseSpeech || typeof window === "undefined") {
      toast.error("Voice input is not available in this browser.");
      return;
    }
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      handleVoiceTranscript(transcript);
    };
    setListening(true);
    recognition.start();
  }

  const contextChips = [
    challengeSlug ? `Mission: ${challengeSlug}` : "No mission attached",
    `${attempts} attempt${attempts === 1 ? "" : "s"}`,
    `${failedTests.length} failed test${failedTests.length === 1 ? "" : "s"}`,
    `${hintUsage} hint${hintUsage === 1 ? "" : "s"} used`
  ];

  return (
    <Card className={`${compact ? "h-full" : ""} holo-panel overflow-hidden border-cyan-300/25 shadow-[0_18px_90px_rgba(34,211,238,0.14)]`}>
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/35 bg-cyan-300/15 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.26)]">
                <Bot className="h-4 w-4" />
              </span>
              Genie Mentor Core
            </CardTitle>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/70">
              {assistantModeLabels[activeMode]} protocol / contextual guardrails active
            </p>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" type="button" onClick={() => speak(latestAssistant?.content)} aria-label="Read Genie response">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" type="button" onClick={stopSpeaking} aria-label="Stop speaking">
              <VolumeX className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-2 text-xs font-semibold text-slate-300 sm:grid-cols-3">
          {["Progressive hints", "Failed-test aware", "Solution guarded"].map((item) => (
            <div key={item} className="stat-tile rounded-md px-2.5 py-2 text-cyan-50">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-lime-200" />
              {item}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {visibleModes.map((item) => {
            const Icon = modeIcon[item] ?? BrainCircuit;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveMode(item)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-bold transition ${
                  activeMode === item
                    ? "border-cyan-200 bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.22)]"
                    : "border-white/10 bg-white/6 text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {assistantModeLabels[item]}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 rounded-md border border-white/10 bg-black/25 p-3">
          <div className="flex flex-wrap gap-2">
            {contextChips.map((chip) => (
              <span key={chip} className="rounded-md border border-white/10 bg-white/6 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-300">
                {chip}
              </span>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Progressive hint depth</div>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setHintLevel(level)}
                    className={`grid h-8 w-8 place-items-center rounded-md border text-xs font-black ${
                      hintLevel === level ? "border-yellow-200 bg-yellow-300 text-slate-950" : "border-white/10 bg-white/6 text-slate-300"
                    }`}
                    aria-label={`Set hint level ${level}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSpeakResponses((current) => !current)}
              className={`rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                speakResponses ? "border-lime-300/50 bg-lime-300/15 text-lime-100" : "border-white/10 bg-white/6 text-slate-300"
              }`}
            >
              Voice output {speakResponses ? "on" : "off"}
            </button>
          </div>
        </div>

        <div className="grid max-h-80 gap-3 overflow-auto rounded-md border border-cyan-300/15 bg-black/38 p-3">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={
                message.role === "assistant"
                  ? "max-w-[92%] rounded-md border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50"
                  : "ml-auto max-w-[92%] rounded-md border border-yellow-300/15 bg-yellow-300/10 p-3 text-sm leading-6 text-yellow-50"
              }
            >
              <span className="font-bold">{message.role === "assistant" ? "Genie" : "You"}:</span> {message.content}
            </div>
          ))}
          {loading ? <div className="text-sm text-slate-400">Genie is reading the mission context...</div> : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: "Give me a hint", mode: "hint" as AssistantMode, prompt: `Give me a level ${hintLevel} hint.` },
            { label: "Explain failed test", mode: "debugging" as AssistantMode, prompt: "Explain my latest failed test and likely misconception." },
            { label: "Review my code", mode: "code-review" as AssistantMode, prompt: "Review my current code for correctness, complexity, and edge cases." },
            { label: "Interview me", mode: "interviewer" as AssistantMode, prompt: "Act as an interviewer and ask the next follow-up question." },
            { label: "Explain concept", mode: "explain" as AssistantMode, prompt: "Explain the core concept behind this mission." },
            { label: "Motivate next rep", mode: "motivation" as AssistantMode, prompt: "Motivate me and pick the smallest useful next rep." }
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setActiveMode(action.mode);
                void sendMessage(action.prompt, { mode: action.mode });
              }}
              className="rounded-md border border-white/10 bg-white/6 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => sendMessage(suggestion)}
              className="rounded-md border border-white/10 bg-white/6 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask for a hint, failed-test explanation, code review, SQL review, Linux command coaching, or interview drill..."
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => sendMessage()} disabled={loading}>
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button type="button" variant="secondary" onClick={listen} disabled={listening}>
            <Mic className="h-4 w-4" />
            {listening ? "Listening..." : "Voice"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => sendMessage("Reveal the full solution. I understand this may reduce learning rewards.", { hintLevel: 5, allowSolution: true })}>
            <Lightbulb className="h-4 w-4" />
            Reveal Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
