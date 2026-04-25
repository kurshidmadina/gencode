import { getLeaderboard } from "@/lib/repositories/dashboard";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { leaderboardQuerySchema } from "@/lib/validators";

export async function GET(request: Request) {
  const limit = rateLimit(`leaderboard:${getClientIp(request)}`, 120);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const url = new URL(request.url);
  const parsed = leaderboardQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return Response.json({ error: "Invalid leaderboard query.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { scope, category, difficulty } = parsed.data;
  const leaderboard = await getLeaderboard(scope, category, difficulty);
  return Response.json({ leaderboard, scope, category, difficulty });
}
