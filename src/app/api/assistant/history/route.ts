import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ sessions: [] });
  const limit = rateLimit(`assistant:history:${session.user.id}:${getClientIp(request)}`, 60);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!(await canReachDatabase())) return Response.json({ sessions: [] });

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 30 } },
      orderBy: { updatedAt: "desc" },
      take: 20
    });
    return Response.json({ sessions });
  } catch {
    return Response.json({ sessions: [] });
  }
}
