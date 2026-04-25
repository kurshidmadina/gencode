import { getServerEnv } from "@/lib/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const order: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const secretKeyPattern = /(password|secret|token|api[_-]?key|authorization|cookie)/i;

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, secretKeyPattern.test(key) ? "[redacted]" : redact(nested)])
    );
  }
  if (typeof value === "string" && /(sk-[a-z0-9_-]{20,}|bearer\s+[a-z0-9._-]+)/i.test(value)) return "[redacted]";
  return value;
}

function shouldLog(level: LogLevel) {
  const configured = getServerEnv().LOG_LEVEL;
  return order[level] >= order[configured];
}

export function logEvent(level: LogLevel, event: string, metadata: Record<string, unknown> = {}) {
  if (!shouldLog(level)) return;
  const safeMetadata = redact(metadata) as Record<string, unknown>;
  const payload = JSON.stringify({
    level,
    event,
    time: new Date().toISOString(),
    ...safeMetadata
  });

  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.log(payload);
  }
}

export function logInfo(event: string, metadata?: Record<string, unknown>) {
  logEvent("info", event, metadata ?? {});
}

export function logWarn(event: string, metadata?: Record<string, unknown>) {
  logEvent("warn", event, metadata ?? {});
}

export function logError(event: string, metadata?: Record<string, unknown>) {
  logEvent("error", event, metadata ?? {});
}
