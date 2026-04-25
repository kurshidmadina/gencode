import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserChallengeAccess } from "@/lib/game/access";
import { findChallenge } from "@/lib/repositories/challenges";
import { getChallengeRunner } from "@/lib/runner";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { runSubmissionSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const limit = rateLimit(`run:${getClientIp(request)}:${slug}`, 40);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const challenge = await findChallenge(slug);
  if (!challenge) return Response.json({ error: "Challenge not found." }, { status: 404 });
  const session = await getServerSession(authOptions).catch(() => null);
  const access = await getUserChallengeAccess(session?.user?.id, challenge);
  if (access.locked) return Response.json({ error: access.reason, locked: true }, { status: 423 });

  const body = await request.json().catch(() => null);
  const parsed = runSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid answer.", details: parsed.error.flatten() }, { status: 400 });
  }

  const result = await getChallengeRunner().run({
    challenge,
    answer: parsed.data.answer,
    mode: "run",
    userId: session?.user?.id,
    requestId: crypto.randomUUID()
  });
  return Response.json(result);
}
