import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBillingSnapshot } from "@/lib/billing/usage";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Login required to view usage." }, { status: 401 });
  const snapshot = await getUserBillingSnapshot(session.user.id);
  return Response.json({
    planId: snapshot.plan.id,
    daily: snapshot.dailyUsage,
    monthly: snapshot.monthlyUsage,
    limits: snapshot.limits
  });
}
