import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { sanitizePlainText, sanitizeStringArray } from "@/lib/security/sanitize";
import { profileSettingsSchema } from "@/lib/validators";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }
  const limit = rateLimit(`settings:profile:${session.user.id}:${getClientIp(request)}`, 20);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  if (!(await canReachDatabase())) {
    return Response.json(
      { error: "Database is not reachable. Start Postgres before saving persistent settings." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid profile settings.", details: parsed.error.flatten() }, { status: 400 });
  }

  const safeName = sanitizePlainText(parsed.data.name, 80);
  const safeBio = parsed.data.bio ? sanitizePlainText(parsed.data.bio, 500) : undefined;
  const safeCategories = sanitizeStringArray(parsed.data.favoriteCategories, 8, 40);

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: safeName,
      profile: {
        upsert: {
          create: {
            bio: safeBio,
            favoriteCategories: safeCategories,
            publicProfile: parsed.data.publicProfile,
            skillGraph: {
              preferences: {
                genieMode: parsed.data.genieMode
              }
            }
          },
          update: {
            bio: safeBio,
            favoriteCategories: safeCategories,
            publicProfile: parsed.data.publicProfile,
            skillGraph: {
              preferences: {
                genieMode: parsed.data.genieMode
              }
            }
          }
        }
      }
    },
    include: { profile: true }
  });

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      profile: user.profile
    }
  });
}
