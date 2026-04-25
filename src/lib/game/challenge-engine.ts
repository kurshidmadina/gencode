import type { GeneratedChallenge } from "./types";

export type JudgeInput = {
  challenge: GeneratedChallenge;
  answer: string;
  mode: "run" | "submit";
};

export type JudgeResult = {
  status: "PASSED" | "FAILED" | "PARTIAL";
  score: number;
  runtime: number;
  memory: number;
  testResults: Array<{
    name: string;
    passed: boolean;
    expected?: string;
    actual?: string;
    message: string;
  }>;
};

export type SafetyValidation = {
  ok: boolean;
  reason?: string;
};

export function validateLinuxCommandSafety(answer: string): SafetyValidation {
  const dangerous = /\b(rm\s+-rf|mkfs|dd\s+if=|:(){|shutdown|reboot|curl\s+.+\|\s*sh|wget\s+.+\|\s*sh|chmod\s+777\s+\/|chown\s+.+\s+\/)\b/i.test(
    answer
  );
  if (dangerous) {
    return {
      ok: false,
      reason: "Potentially destructive command pattern blocked by the local safe judge."
    };
  }
  return { ok: true };
}

export function validateSqlSafety(answer: string): SafetyValidation {
  const unsafe = /\b(drop|truncate|delete|update|insert|alter|grant|revoke|copy\s+.*program|execute|call)\b/i.test(answer);
  if (unsafe) {
    return {
      ok: false,
      reason: "Mutation, DDL, or executable SQL statements are blocked by the local safe judge."
    };
  }
  return { ok: true };
}

function evaluateLinux(answer: string, challenge: GeneratedChallenge, hidden: boolean) {
  const normalized = answer.toLowerCase();
  const commandHits = ["rg", "grep", "find", "awk", "sed", "sort", "uniq", "xargs"].filter((command) =>
    new RegExp(`\\b${command}\\b`).test(normalized)
  ).length;
  const hasPipe = answer.includes("|");
  const quotesPaths = /["']|\b-print0\b|\b--null\b|\b-z\b/.test(answer);
  const mentionsTopic = challenge.tags.some((tag) => normalized.includes(tag.replaceAll("-", " ")));
  const score = commandHits * 17 + (hasPipe ? 18 : 0) + (mentionsTopic ? 20 : 0) + (quotesPaths ? 12 : 0);

  return hidden ? score >= 72 && quotesPaths : score >= 55;
}

function evaluateSql(answer: string, challenge: GeneratedChallenge, hidden: boolean) {
  const normalized = answer.trim().toLowerCase();
  const isSelect = /^with\b|^select\b/.test(normalized);
  const hasFrom = /\bfrom\b/.test(normalized);
  const hasDeterministicOrder = /\border\s+by\b/.test(normalized);
  const hasAggregationOrJoin = /\b(count|sum|avg|min|max|group\s+by|join|over\s*\()\b/.test(normalized);
  const mentionsTopic = challenge.tags.some((tag) => normalized.includes(tag.replaceAll("-", " ")));
  const score =
    (isSelect ? 28 : 0) +
    (hasFrom ? 20 : 0) +
    (hasAggregationOrJoin ? 24 : 0) +
    (hasDeterministicOrder ? 18 : 0) +
    (mentionsTopic ? 10 : 0);

  return hidden ? score >= 78 && hasDeterministicOrder : score >= 58;
}

function evaluateCoding(answer: string, challenge: GeneratedChallenge, hidden: boolean) {
  const normalized = answer.toLowerCase();
  const declaresEntryPoint = /\b(def\s+solve|function\s+solve|solve\s*\(|class\s+solution|int\s+solve)\b/i.test(answer);
  const hasControlFlow = /\b(if|for|while|map|reduce|return|throw|try)\b/i.test(answer);
  const handlesEdges = /\b(empty|null|none|undefined|duplicate|negative|large|edge|length|size)\b/i.test(answer);
  const avoidsEval = !/\b(eval|exec|function\s*\(|system\s*\(|popen)\b/i.test(answer);
  const mentionsTopic = challenge.tags.some((tag) => normalized.includes(tag.replaceAll("-", " ")));
  const score =
    (declaresEntryPoint ? 34 : 0) +
    (hasControlFlow ? 24 : 0) +
    (handlesEdges ? 24 : 0) +
    (avoidsEval ? 10 : 0) +
    (mentionsTopic ? 8 : 0);

  return hidden ? score >= 76 && handlesEdges : score >= 58;
}

function evaluateMultipleChoice(answer: string, hidden: boolean) {
  const normalized = answer.trim();
  const hasLetter = /\b[abcd]\b/i.test(normalized) || /\boption\s+[abcd]\b/i.test(normalized);
  const hasJustification = normalized.split(/\s+/).length >= (hidden ? 14 : 6);
  const mentionsTradeoff = /\b(because|tradeoff|risk|safe|maintain|correct|scale|latency|consistency)\b/i.test(normalized);
  return hidden ? hasLetter && hasJustification && mentionsTradeoff : hasLetter && hasJustification;
}

function evaluateAnswer(answer: string, challenge: GeneratedChallenge, hidden: boolean) {
  if (challenge.type === "LINUX" || challenge.type === "BASH_SCRIPTING" || challenge.type === "GIT_WORKFLOW") {
    return evaluateLinux(answer, challenge, hidden);
  }
  if (challenge.type === "SQL") return evaluateSql(answer, challenge, hidden);
  if (
    challenge.type === "MULTIPLE_CHOICE" ||
    challenge.type === "API_CHALLENGE" ||
    challenge.type === "SYSTEM_DESIGN_MINI" ||
    challenge.type === "OUTPUT_PREDICTION" ||
    challenge.type === "BOSS_STAGE"
  ) {
    return evaluateMultipleChoice(answer, hidden);
  }
  if (challenge.type === "SECURITY_DEBUGGING" && /\b(secret|token|password|api[_-]?key)\s*[:=]\s*['"]?[a-z0-9_-]{8,}/i.test(answer)) {
    return false;
  }
  return evaluateCoding(answer, challenge, hidden);
}

function failureMessage(challenge: GeneratedChallenge, hidden: boolean) {
  if (challenge.type === "SQL") {
    return hidden
      ? "Hidden SQL checks expect deterministic ordering and safe read-only query structure."
      : "Use a read-only SELECT or CTE with FROM, the required grouping/join shape, and a deterministic ORDER BY when needed.";
  }
  if (challenge.type === "LINUX" || challenge.type === "BASH_SCRIPTING" || challenge.type === "GIT_WORKFLOW") {
    return hidden
      ? "Hidden shell checks expect safe quoting or null-delimited handling for unusual paths."
      : "Use a safe pipeline with relevant commands, deterministic output, and the challenge topic in mind.";
  }
  if (
    challenge.type === "MULTIPLE_CHOICE" ||
    challenge.type === "API_CHALLENGE" ||
    challenge.type === "SYSTEM_DESIGN_MINI" ||
    challenge.type === "OUTPUT_PREDICTION" ||
    challenge.type === "BOSS_STAGE"
  ) {
    return hidden
      ? "Hidden concept checks expect a justified choice that mentions the tradeoff or risk."
      : "Select an option and add a short justification.";
  }
  return hidden
    ? "Hidden code checks expect an entry point, control flow, and explicit edge-case handling."
    : "Add a solve entry point, return a result, and handle the visible sample plus edge cases.";
}

export async function runSafeMockJudge({ challenge, answer, mode }: JudgeInput): Promise<JudgeResult> {
  const started = performance.now();
  const trimmed = answer.trim();

  if (!trimmed) {
    return {
      status: "FAILED",
      score: 0,
      runtime: 1,
      memory: 0,
      testResults: [
        {
          name: "answer present",
          passed: false,
          message: "The judge received an empty answer."
        }
      ]
    };
  }

  const shellSafety = validateLinuxCommandSafety(trimmed);
  if (!shellSafety.ok) {
    return {
      status: "FAILED",
      score: 0,
      runtime: 2,
      memory: 1,
      testResults: [
        {
          name: "security guard",
          passed: false,
          message: shellSafety.reason ?? "Potentially destructive command pattern blocked by the local safe judge."
        }
      ]
    };
  }

  const sqlSafety = challenge.type === "SQL" ? validateSqlSafety(trimmed) : { ok: true };
  if (!sqlSafety.ok) {
    return {
      status: "FAILED",
      score: 0,
      runtime: 2,
      memory: 1,
      testResults: [
        {
          name: "read-only SQL guard",
          passed: false,
          message: sqlSafety.reason ?? "Mutation, DDL, or executable SQL statements are blocked by the local safe judge."
        }
      ]
    };
  }

  const visibleCases = challenge.testCases.map((testCase, index) => {
    const passed = evaluateAnswer(trimmed, challenge, false);
    return {
      name: testCase.name ?? `visible ${index + 1}`,
      passed,
      expected: String(testCase.expected ?? "valid result"),
      actual: passed ? String(testCase.expected ?? "valid result") : "needs refinement",
      message: passed
        ? "Visible check passed in the type-aware local safe judge."
        : failureMessage(challenge, false)
    };
  });

  const hiddenCases =
    mode === "submit"
      ? challenge.hiddenTestCases.map((testCase, index) => {
          const passed = evaluateAnswer(trimmed, challenge, true);
          return {
            name: testCase.name ?? `hidden ${index + 1}`,
            passed,
            expected: String(testCase.expected ?? "robust behavior"),
            actual: passed ? String(testCase.expected ?? "robust behavior") : "edge case not demonstrated",
            message: passed
              ? "Hidden-style robustness check passed."
              : failureMessage(challenge, true)
          };
        })
      : [];

  const testResults = [...visibleCases, ...hiddenCases];
  const passedCount = testResults.filter((result) => result.passed).length;
  const score = Math.round((passedCount / Math.max(1, testResults.length)) * 100);

  return {
    status: score === 100 ? "PASSED" : score >= 50 ? "PARTIAL" : "FAILED",
    score,
    runtime: Math.max(1, Math.round(performance.now() - started)),
    memory: 8 + trimmed.length % 24,
    testResults
  };
}
