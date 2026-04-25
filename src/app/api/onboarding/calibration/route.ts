import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { recommendLearningPath } from "@/lib/game/learning-paths";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const calibrationSchema = z.object({
  experienceLevel: z.enum(["new", "beginner", "intermediate", "advanced"]),
  targetGoal: z.string().min(4).max(240),
  preferredCategories: z.array(z.string().min(2).max(40)).min(1).max(8),
  weakestTopics: z.array(z.string().min(2).max(60)).max(10),
  preferredLanguage: z.string().min(2).max(30),
  minutesPerDay: z.number().int().min(10).max(180),
  preparingFor: z.string().min(2).max(80)
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null);
  const limit = rateLimit(`onboarding:${session?.user?.id ?? getClientIp(request)}`, 15);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = calibrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid calibration answers.", details: parsed.error.flatten() }, { status: 400 });
  }

  const recommendedPathSlug = recommendLearningPath(parsed.data);

  if (session?.user?.id && (await canReachDatabase())) {
    await prisma.onboardingProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...parsed.data,
        recommendedPathSlug
      },
      create: {
        userId: session.user.id,
        ...parsed.data,
        recommendedPathSlug
      }
    });

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { favoriteCategories: parsed.data.preferredCategories },
      create: {
        userId: session.user.id,
        favoriteCategories: parsed.data.preferredCategories,
        bio: "Training inside Gencode."
      }
    });
  }

  return Response.json({ recommendedPathSlug });
}
