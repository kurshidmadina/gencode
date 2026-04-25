import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { challengeCatalog } from "@/lib/game/challenge-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return Response.json({ error: "Admin role required." }, { status: 403 });

  try {
    const [users, challenges, submissions, passed] = await Promise.all([
      prisma.user.count(),
      prisma.challenge.count(),
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PASSED" } })
    ]);

    return Response.json({
      users,
      challenges,
      submissions,
      completionRate: submissions === 0 ? 0 : Math.round((passed / submissions) * 100)
    });
  } catch {
    return Response.json({ users: 0, challenges: challengeCatalog.length, submissions: 0, completionRate: 0 });
  }
}
