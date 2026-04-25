import { buildAssistantPrompt, type AssistantRuntimeContext } from "@/lib/assistant/context";
import { modeInstruction, type AssistantMode } from "@/lib/assistant/modes";
import { getServerEnv } from "@/lib/env";
import { getChallengeBySlug } from "@/lib/game/challenge-data";

export type { AssistantMode } from "@/lib/assistant/modes";

export type AssistantRequest = {
  message: string;
  mode: AssistantMode;
  challengeSlug?: string;
  history?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: AssistantRuntimeContext;
  hintLevel?: number;
  allowSolution?: boolean;
};

export type AssistantResponse = {
  content: string;
  safety: {
    fullSolutionWithheld: boolean;
    reason?: string;
  };
  metadata: {
    provider: string;
    mode: AssistantMode;
    voiceReady: boolean;
    hintLevel?: number;
    contextUsed: boolean;
    usage?: {
      promptTokens?: number | null;
      completionTokens?: number | null;
    };
  };
};

export interface AssistantProvider {
  name: string;
  send(input: AssistantRequest): Promise<AssistantResponse>;
}

function isAskingForFullSolution(message: string) {
  return /\b(full solution|give me the answer|paste the answer|solve it for me|final code|show me the solution|just tell me)\b/i.test(message);
}

function containsSecretLikeContent(message: string) {
  return /\b(sk-[A-Za-z0-9_-]{20,}|api[_-]?key\s*[:=]|password\s*[:=]|token\s*[:=]|secret\s*[:=]|-----BEGIN\s+(RSA|OPENSSH|PRIVATE)\s+KEY-----)\b/i.test(
    message
  );
}

function requestedHintLevel(input: AssistantRequest) {
  return Math.max(1, Math.min(5, Math.trunc(input.hintLevel ?? input.context?.client.requestedHintLevel ?? 1)));
}

function canRevealSolution(input: AssistantRequest) {
  return Boolean(
    input.allowSolution ||
      input.context?.client.allowSolution ||
      input.context?.client.completed ||
      input.context?.progress.status === "COMPLETED"
  );
}

function modeLead(mode: AssistantMode) {
  const leads: Record<AssistantMode, string> = {
    mentor: "Let's turn this into a clean training rep.",
    hint: "Here is the next useful nudge.",
    debugging: "Start by shrinking the failure until it has nowhere to hide.",
    interviewer: "I will push like an interviewer, but fairly.",
    socratic: "Let me ask the question that unlocks the next move.",
    explain: "The core idea is smaller than it looks.",
    concept: "The core idea is smaller than it looks.",
    "code-review": "I will review the approach like a calm senior engineer.",
    "sql-review": "I will inspect the query shape before the answer.",
    "linux-coach": "We will keep the terminal safe and deterministic.",
    motivation: "Small reps compound into durable skill.",
    vr: "Voice mode ready.",
    coach: "You are closer than the scoreboard makes it feel."
  };

  return leads[mode];
}

function challengeLine(input: AssistantRequest) {
  const challenge = input.context?.challenge;
  if (!challenge) return "No active challenge is attached.";
  return `${challenge.title} is a ${challenge.difficulty.toLowerCase()} ${challenge.type.toLowerCase().replaceAll("_", " ")} mission in ${challenge.category}. Success means: ${challenge.successCriteria.slice(0, 2).join("; ") || challenge.learningObjective}.`;
}

function firstFailedTest(context?: AssistantRuntimeContext) {
  return context?.client.failedTests.find((test) => !test.passed) ?? context?.client.failedTests[0];
}

function buildFailedTestExplanation(input: AssistantRequest) {
  const failed = firstFailedTest(input.context);
  const challenge = input.context?.challenge;
  const topic = challenge?.tags[0] ?? challenge?.category ?? "this skill";

  if (!failed) {
    return `${modeLead("debugging")} ${challengeLine(input)} I do not have a failed test payload yet. Run tests, then bring me the first failing case with expected and actual output. Start by checking the smallest boundary case before changing the main algorithm.`;
  }

  const expected = failed.expected ? ` Expected: ${failed.expected}.` : "";
  const actual = failed.actual ? ` Actual: ${failed.actual}.` : "";
  return [
    `${modeLead("debugging")} Test "${failed.name}" is the pressure point.${expected}${actual}`,
    failed.message ? `Judge note: ${failed.message}` : "",
    `Likely misunderstanding: your answer is close on the main path, but the ${topic} edge case is not being preserved.`,
    "Next move: write the expected shape for this one case, trace your state after each step, then change the smallest branch that diverges."
  ]
    .filter(Boolean)
    .join(" ");
}

function pseudocodeFor(input: AssistantRequest) {
  const type = input.context?.challenge?.type;
  if (type === "SQL") {
    return "Pseudocode: build a CTE for the base filtered rows, aggregate only after the joins are stable, expose the required columns, then add deterministic ORDER BY.";
  }
  if (type === "LINUX" || type === "BASH_SCRIPTING" || type === "GIT_WORKFLOW") {
    return "Pseudocode: inspect read-only state, filter to the target records, transform one field at a time, sort/count deterministically, then verify the final state without destructive commands.";
  }
  if (type === "MULTIPLE_CHOICE" || type === "SYSTEM_DESIGN_MINI" || type === "OUTPUT_PREDICTION") {
    return "Pseudocode: eliminate answers that violate the scenario, test the remaining claim against the stated constraint, then explain why the rejected options fail.";
  }
  return "Pseudocode: parse inputs, initialize the invariant, process each item once, update state only through that invariant, return the requested shape, then test empty, duplicate, and ordering cases.";
}

function buildProgressiveHint(input: AssistantRequest) {
  const level = requestedHintLevel(input);
  const challenge = input.context?.challenge;
  const topic = challenge?.tags[0] ?? challenge?.category ?? "the current skill";
  const failed = firstFailedTest(input.context);
  const staticChallenge = input.challengeSlug ? getChallengeBySlug(input.challengeSlug) : null;

  if (level >= 5) {
    if (!canRevealSolution(input)) {
      return {
        content:
          "Level 5 is solution-level help. I can reveal it only after completion or after you explicitly choose to spend the learning reward. For now: ask for level 4 and I will give pseudocode without taking the steering wheel.",
        fullSolutionWithheld: true
      };
    }

    return {
      content: [
        "Solution-level help unlocked. Here is the reference approach:",
        staticChallenge?.solution ?? challenge?.explanation ?? "No reference solution is stored for this mission yet.",
        challenge?.explanation ? `Why it works: ${challenge.explanation}` : ""
      ]
        .filter(Boolean)
        .join("\n\n"),
      fullSolutionWithheld: false
    };
  }

  const hints: Record<number, string> = {
    1: `${modeLead("hint")} Level 1: name the invariant before touching the editor. For ${topic}, what must stay true after each step?`,
    2: `${modeLead("hint")} Level 2: focus on the output shape and the first visible check. Do not optimize yet; make the smallest case deterministic.`,
    3: failed
      ? `${modeLead("hint")} Level 3: the exact pressure point is "${failed.name}". Expected ${failed.expected ?? "the documented shape"} but got ${failed.actual ?? "a different shape"}. Trace only that case.`
      : `${modeLead("hint")} Level 3: the likely algorithm is already implied by the success criteria. Pick the data structure or clause that preserves ordering, uniqueness, and boundary behavior.`,
    4: `${modeLead("hint")} Level 4: ${pseudocodeFor(input)}`
  };

  return { content: hints[level], fullSolutionWithheld: false };
}

function buildModeReply(input: AssistantRequest) {
  const challenge = input.context?.challenge;
  const topic = challenge?.tags[0] ?? challenge?.category ?? "the current skill";
  const fullSolutionRequested = isAskingForFullSolution(input.message);

  if (containsSecretLikeContent(input.message)) {
    return {
      content:
        "That looks like a secret or credential. I will not process or repeat it. Redact the value, describe the failure, and I can still help safely.",
      fullSolutionWithheld: false
    };
  }

  if (fullSolutionRequested && !canRevealSolution(input)) {
    return {
      content:
        "I will not dump the full solution before you get the learning rep. We can still move step by step. If you want to reveal it anyway, confirm solution reveal after a real attempt; it may reduce no-hint rewards. For now, take a level 3 hint: isolate the first failing case, write expected vs actual, and fix the invariant that diverges.",
      fullSolutionWithheld: true
    };
  }

  if (fullSolutionRequested && canRevealSolution(input)) {
    return buildProgressiveHint({ ...input, hintLevel: 5, allowSolution: true });
  }

  if (input.mode === "hint" || /\b(hint|nudge|clue)\b/i.test(input.message)) {
    return buildProgressiveHint(input);
  }

  if (input.mode === "debugging" || /\b(error|fail|bug|wrong|broken|expected|actual)\b/i.test(input.message)) {
    return { content: buildFailedTestExplanation(input), fullSolutionWithheld: false };
  }

  if (input.mode === "sql-review") {
    return {
      content: `${modeLead("sql-review")} ${challengeLine(input)} Check five things: SELECT-only safety, join cardinality, grouping after filtering, deterministic ordering, and whether the result shape matches the business question. If a test failed, compare expected rows before rewriting the query.`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "linux-coach") {
    return {
      content: `${modeLead("linux-coach")} ${challengeLine(input)} Start read-only, quote paths, prefer null-delimited pipelines when filenames are involved, and sort output so the incident report is reproducible. Never use destructive commands in the simulated lab.`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "code-review") {
    const codeContext = input.context?.client.currentCode ? "I can see your current answer, so I will review shape, invariant, edge cases, and complexity." : "Paste or write the smallest current attempt so I can review it against the tests.";
    return {
      content: `${modeLead("code-review")} ${challengeLine(input)} ${codeContext} First review target: does the code handle empty input, duplicates, ordering, and the required return type?`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "socratic") {
    return {
      content: `${modeLead("socratic")} ${challengeLine(input)} What is the one condition that must remain true after each operation, and which visible test would fail first if that condition is false?`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "interviewer" || /\b(complexity|tradeoff|interview)\b/i.test(input.message)) {
    return {
      content: `${modeLead("interviewer")} ${challengeLine(input)} Defend the invariant, time complexity, space complexity, and failure mode. Follow-up: what input makes the naive approach unacceptable, and what does your approach do instead?`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "explain" || input.mode === "concept") {
    return {
      content: `${modeLead("explain")} ${challengeLine(input)} For ${topic}, learn it as a rule: define the state, protect the boundary case, then prove the output shape. Example: trace one tiny input by hand before trusting the general implementation.`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "motivation" || input.mode === "coach" || /\b(tomorrow|streak|daily|motivate|stuck)\b/i.test(input.message)) {
    const quest = input.context?.progress.activeQuest;
    const path = input.context?.progress.activeLearningPath;
    return {
      content: `${modeLead("motivation")} Your next loop is small on purpose: one mission, one visible test run, one review note. ${quest ? `Current quest: ${quest.title} (${quest.progress}/${quest.goal}). ` : ""}${path ? `Path signal: ${path.name}. ` : ""}Stop with the next rep queued so tomorrow has less friction.`,
      fullSolutionWithheld: false
    };
  }

  if (input.mode === "vr" || /\bread the problem\b/i.test(input.message)) {
    return {
      content: challenge
        ? `${challenge.title}. Goal: ${challenge.instructions.slice(0, 170)}`
        : "VR mentor ready. Open a mission, then ask for a hint, test run, or short explanation.",
      fullSolutionWithheld: false
    };
  }

  return {
    content: `${modeLead(input.mode)} ${challengeLine(input)} For ${topic}, write the expected shape before coding. ${modeInstruction(input.mode)} Make one visible test pass, add one edge-case check, and only then optimize.`,
    fullSolutionWithheld: false
  };
}

export class MockAssistantProvider implements AssistantProvider {
  name = "mock";

  async send(input: AssistantRequest): Promise<AssistantResponse> {
    const reply = buildModeReply(input);
    return {
      content: reply.content,
      safety: {
        fullSolutionWithheld: reply.fullSolutionWithheld,
        reason: reply.fullSolutionWithheld ? "Gencode hint policy blocks premature full-answer dumps." : undefined
      },
      metadata: {
        provider: this.name,
        mode: input.mode,
        voiceReady: true,
        hintLevel: requestedHintLevel(input),
        contextUsed: Boolean(input.context),
        usage: {
          promptTokens: null,
          completionTokens: null
        }
      }
    };
  }
}

export class OpenAICompatibleAssistantProvider implements AssistantProvider {
  name = "openai-compatible";

  async send(input: AssistantRequest): Promise<AssistantResponse> {
    if (containsSecretLikeContent(input.message)) {
      return new MockAssistantProvider().send(input);
    }

    const fullSolutionRequested = isAskingForFullSolution(input.message);
    if (fullSolutionRequested && !canRevealSolution(input)) {
      return new MockAssistantProvider().send(input);
    }

    const env = getServerEnv();
    const apiKey = env.OPENAI_COMPATIBLE_API_KEY;
    if (!apiKey) {
      return new MockAssistantProvider().send(input);
    }

    const prompt = buildAssistantPrompt({
      mode: input.mode,
      message: input.message,
      context:
        input.context ??
        ({
          progress: { attempts: 0, hintUsage: 0, completedChallenges: 0, weakCategories: [], recentSubmissions: [] },
          client: { failedTests: [], requestedHintLevel: requestedHintLevel(input), allowSolution: false, voice: input.mode === "vr", completed: false }
        } as AssistantRuntimeContext),
      history: input.history
    });

    const staticChallenge = input.challengeSlug ? getChallengeBySlug(input.challengeSlug) : null;
    const solutionMessage =
      fullSolutionRequested && canRevealSolution(input) && staticChallenge?.solution
        ? [{ role: "system" as const, content: `Solution reference is allowed for this request:\n${staticChallenge.solution}\n\nExplanation:\n${staticChallenge.explanation}` }]
        : [];

    const response = await fetch(`${env.OPENAI_COMPATIBLE_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: env.OPENAI_COMPATIBLE_MODEL,
        messages: [...prompt.messages.slice(0, 2), ...solutionMessage, ...prompt.messages.slice(2)],
        temperature: input.mode === "vr" ? 0.25 : 0.35
      })
    });

    if (!response.ok) {
      return new MockAssistantProvider().send(input);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    const content = data.choices?.[0]?.message?.content ?? "I could not reach the mentor model. Try again in a moment.";

    return {
      content,
      safety: {
        fullSolutionWithheld: false
      },
      metadata: {
        provider: this.name,
        mode: input.mode,
        voiceReady: true,
        hintLevel: requestedHintLevel(input),
        contextUsed: Boolean(input.context),
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? null,
          completionTokens: data.usage?.completion_tokens ?? null
        }
      }
    };
  }
}

export function getAssistantProvider(): AssistantProvider {
  if (getServerEnv().ASSISTANT_PROVIDER === "openai-compatible") {
    return new OpenAICompatibleAssistantProvider();
  }

  return new MockAssistantProvider();
}
