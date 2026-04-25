import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { getUserChallengeAccess } from "@/lib/game/access";
import { findChallenge } from "@/lib/repositories/challenges";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { hintRequestSchema } from "@/lib/validators";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const limit = rateLimit(`hint:${session?.user?.id ?? getClientIp(request)}:${slug}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const challenge = await findChallenge(slug);
  if (!challenge) return Response.json({ error: "Challenge not found." }, { status: 404 });
  const access = await getUserChallengeAccess(session?.user?.id, challenge);
  if (access.locked) return Response.json({ error: access.reason, locked: true }, { status: 423 });
  const body = await request.json().catch(() => ({}));
  const parsed = hintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid hint request.", details: parsed.error.flatten() }, { status: 400 });
  }
  const hint = challenge.hints[Math.min(parsed.data.hintIndex, challenge.hints.length - 1)];

  if (session?.user?.id && (await canReachDatabase())) {
    try {
      const dbChallenge = await prisma.challenge.findUnique({ where: { slug } });
      if (dbChallenge) {
        await prisma.challengeHintUsage.upsert({
          where: {
            userId_challengeId_hintIndex: {
              userId: session.user.id,
              challengeId: dbChallenge.id,
              hintIndex: parsed.data.hintIndex
            }
          },
          create: {
            userId: session.user.id,
            challengeId: dbChallenge.id,
            hintIndex: parsed.data.hintIndex
          },
          update: {}
        });
      }
    } catch {
      // Hint still returns when persistence is unavailable.
    }
  }

  return Response.json({ hint, index: parsed.data.hintIndex, total: challenge.hints.length });
}
