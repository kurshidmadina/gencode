import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { salesLeadSchema } from "@/lib/billing/validators";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { sanitizePlainText } from "@/lib/security/sanitize";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions).catch(() => null);
  const limit = rateLimit(`sales:${getClientIp(request)}:${session?.user?.id ?? "anon"}`, 8);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = salesLeadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid sales lead.", details: parsed.error.flatten() }, { status: 400 });
  }
  if (!(await canReachDatabase())) {
    return Response.json({
      ok: true,
      persisted: false,
      message: "Sales request received locally. Connect Postgres to persist leads."
    });
  }

  const lead = await prisma.salesLead.create({
    data: {
      userId: session?.user?.id,
      name: sanitizePlainText(parsed.data.name, 120),
      email: parsed.data.email.toLowerCase(),
      organization: parsed.data.organization ? sanitizePlainText(parsed.data.organization, 160) : null,
      teamSize: parsed.data.teamSize,
      useCase: sanitizePlainText(parsed.data.useCase, 120),
      message: sanitizePlainText(parsed.data.message, 2_000),
      source: sanitizePlainText(parsed.data.source, 80)
    }
  });

  return Response.json({ ok: true, persisted: true, leadId: lead.id });
}
