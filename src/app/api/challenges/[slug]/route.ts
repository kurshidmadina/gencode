import { getServerSession } from "next-auth";
import type { Prisma } from "@prisma/client";
import { authOptions, isAdmin } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { findChallenge } from "@/lib/repositories/challenges";
import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/security/admin-audit";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { challengeUpdateSchema } from "@/lib/validators";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const challenge = await findChallenge(slug);
  if (!challenge) return Response.json({ error: "Challenge not found." }, { status: 404 });
  return Response.json({ challenge });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Admin role required." }, { status: 403 });
  const limit = rateLimit(`admin:challenge:update:${session?.user?.id ?? "unknown"}:${getClientIp(request)}`, 30);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Start Postgres before editing challenges." }, { status: 503 });
  }
  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const parsed = challengeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid challenge update.", details: parsed.error.flatten() }, { status: 400 });
  }

  const challenge = await prisma.challenge.update({
    where: { slug },
    data: parsed.data as Prisma.ChallengeUncheckedUpdateInput
  });
  await recordAdminAudit({
    actorId: session?.user?.id,
    action: "challenge.update",
    target: "challenge",
    targetId: challenge.id,
    metadata: { slug, fields: Object.keys(parsed.data) }
  });

  return Response.json({ challenge });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Admin role required." }, { status: 403 });
  const limit = rateLimit(`admin:challenge:archive:${session?.user?.id ?? "unknown"}:${getClientIp(request)}`, 15);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Start Postgres before archiving challenges." }, { status: 503 });
  }
  const { slug } = await params;
  const challenge = await prisma.challenge.update({
    where: { slug },
    data: { status: "ARCHIVED" }
  });
  await recordAdminAudit({
    actorId: session?.user?.id,
    action: "challenge.archive",
    target: "challenge",
    targetId: challenge.id,
    metadata: { slug }
  });
  return Response.json({ ok: true });
}
