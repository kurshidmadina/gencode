import bcrypt from "bcryptjs";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const limit = rateLimit(`register:${getClientIp(request)}`, 10);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);
  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Start Postgres before creating accounts." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid registration data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: sanitizePlainText(parsed.data.name, 80),
        email,
        username,
        passwordHash,
        profile: {
          create: {
            bio: "Training in the Gencode arena.",
            favoriteCategories: ["linux", "sql", "algorithms"]
          }
        }
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    });

    return Response.json({ user }, { status: 201 });
  } catch {
    return Response.json({ error: "Email or username already exists, or the database is not ready." }, { status: 409 });
  }
}
