export const assistantModes = [
  "mentor",
  "hint",
  "debugging",
  "interviewer",
  "socratic",
  "explain",
  "concept",
  "code-review",
  "sql-review",
  "linux-coach",
  "motivation",
  "vr",
  "coach"
] as const;

export type AssistantMode = (typeof assistantModes)[number];

export const assistantModeLabels: Record<AssistantMode, string> = {
  mentor: "Mentor",
  hint: "Hint",
  debugging: "Debug",
  interviewer: "Interview",
  socratic: "Socratic",
  explain: "Explain",
  concept: "Explain",
  "code-review": "Code Review",
  "sql-review": "SQL Review",
  "linux-coach": "Linux Coach",
  motivation: "Motivation",
  vr: "VR Voice",
  coach: "Coach"
};

export function normalizeAssistantMode(mode: string): AssistantMode {
  const normalized = mode.toLowerCase().trim();
  const aliases: Record<string, AssistantMode> = {
    debug: "debugging",
    interviewer: "interviewer",
    interview: "interviewer",
    explanation: "explain",
    explain: "explain",
    concept: "concept",
    review: "code-review",
    "code review": "code-review",
    sql: "sql-review",
    "sql review": "sql-review",
    linux: "linux-coach",
    "linux coach": "linux-coach",
    vr: "vr",
    voice: "vr",
    coach: "coach"
  };

  return assistantModes.includes(normalized as AssistantMode)
    ? (normalized as AssistantMode)
    : aliases[normalized] ?? "mentor";
}

export function modeInstruction(mode: AssistantMode) {
  const instructions: Record<AssistantMode, string> = {
    mentor: "Coach with a short plan, then ask for the user's next attempt.",
    hint: "Give progressive help at the requested hint level without collapsing the whole challenge.",
    debugging: "Use failed tests, expected behavior, actual behavior, and likely misconception before suggesting a fix.",
    interviewer: "Ask like a technical interviewer: push invariants, complexity, tradeoffs, and edge cases.",
    socratic: "Guide with precise questions before giving direct answers.",
    explain: "Explain the concept clearly with one concrete example and one edge case.",
    concept: "Explain the concept clearly with one concrete example and one edge case.",
    "code-review": "Review submitted code for correctness, complexity, edge cases, maintainability, and unsafe patterns.",
    "sql-review": "Review SQL for read-only safety, joins, grouping, determinism, and performance.",
    "linux-coach": "Coach safe shell commands, quoting, null-delimited paths, and read-only incident habits.",
    motivation: "Encourage based on the user's progress, then assign one concrete next rep.",
    vr: "Keep responses under 35 words and phrase them for speech output.",
    coach: "Motivate briefly, then give one measurable next action."
  };

  return instructions[mode];
}
