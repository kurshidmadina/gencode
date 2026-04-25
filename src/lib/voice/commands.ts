import type { AssistantMode } from "@/lib/assistant/modes";

export type VoiceCommand =
  | { type: "READ_PROBLEM" }
  | { type: "GIVE_HINT" }
  | { type: "RUN_TESTS" }
  | { type: "SUBMIT" }
  | { type: "EXPLAIN_ERROR" }
  | { type: "NEXT_CHALLENGE" }
  | { type: "SHOW_PROGRESS" }
  | { type: "SHOW_DASHBOARD" }
  | { type: "ENTER_VR" }
  | { type: "EXIT_VR" }
  | { type: "STOP_SPEAKING" }
  | { type: "SWITCH_MODE"; mode: AssistantMode }
  | { type: "UNKNOWN"; transcript: string };

export function parseVoiceCommand(transcript: string): VoiceCommand {
  const normalized = transcript.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

  if (/\b(read|repeat)\b.*\b(problem|challenge|prompt)\b/.test(normalized)) return { type: "READ_PROBLEM" };
  if (/\b(hint|nudge|clue)\b/.test(normalized)) return { type: "GIVE_HINT" };
  if (/\b(stop|cancel|quiet|mute)\b.*\b(speaking|talking|voice|audio)\b|\bstop genie\b/.test(normalized)) return { type: "STOP_SPEAKING" };
  if (/\b(run|execute)\b.*\b(code|tests?|checks?)\b/.test(normalized)) return { type: "RUN_TESTS" };
  if (/\bsubmit|final answer|turn it in\b/.test(normalized)) return { type: "SUBMIT" };
  if (/\b(explain|why)\b.*\b(error|failure|failed|wrong)\b/.test(normalized)) return { type: "EXPLAIN_ERROR" };
  if (/\b(next|open next)\b.*\b(challenge|mission)\b/.test(normalized)) return { type: "NEXT_CHALLENGE" };
  if (/\b(show|read|what is|tell me)\b.*\b(progress|xp|rank|streak|level)\b/.test(normalized)) return { type: "SHOW_PROGRESS" };
  if (/\b(show|open|go to|switch to)\b.*\bdashboard\b/.test(normalized)) return { type: "SHOW_DASHBOARD" };
  if (/\b(enter|open|start)\b.*\b(vr|immersive)\b/.test(normalized)) return { type: "ENTER_VR" };
  if (/\b(exit|leave|close)\b.*\b(vr|immersive|arena)\b/.test(normalized)) return { type: "EXIT_VR" };
  if (/\binterview\b.*\bmode\b|\bmode\b.*\binterview\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "interviewer" };
  if (/\bdebug\b.*\bmode\b|\bmode\b.*\bdebug\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "debugging" };
  if (/\bexplain\b.*\bmode\b|\bmode\b.*\bexplain\b|\bconcept\b.*\bmode\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "explain" };
  if (/\bsocratic\b.*\bmode\b|\bmode\b.*\bsocratic\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "socratic" };
  if (/\bcode\b.*\breview\b.*\bmode\b|\bmode\b.*\bcode\b.*\breview\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "code-review" };
  if (/\bsql\b.*\breview\b.*\bmode\b|\bmode\b.*\bsql\b.*\breview\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "sql-review" };
  if (/\blinux\b.*\b(coach|mode)\b|\bmode\b.*\blinux\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "linux-coach" };
  if (/\bmotivation\b.*\bmode\b|\bmode\b.*\bmotivation\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "motivation" };
  if (/\bvr\b.*\bmode\b|\bvoice\b.*\bmode\b|\bmode\b.*\b(vr|voice)\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "vr" };
  if (/\bhint\b.*\bmode\b|\bmode\b.*\bhint\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "hint" };
  if (/\bmentor\b.*\bmode\b|\bmode\b.*\bmentor\b/.test(normalized)) return { type: "SWITCH_MODE", mode: "mentor" };

  return { type: "UNKNOWN", transcript };
}
