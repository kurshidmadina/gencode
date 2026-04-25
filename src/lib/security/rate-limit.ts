import { getServerEnv } from "@/lib/env";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(key: string, limit = getServerEnv().RATE_LIMIT_MAX_REQUESTS) {
  const windowMs = getServerEnv().RATE_LIMIT_WINDOW_MS;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;

  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt
  };
}

export function rateLimitResponse(resetAt: number) {
  return Response.json(
    { error: "Too many requests. Slow down and try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)))
      }
    }
  );
}
