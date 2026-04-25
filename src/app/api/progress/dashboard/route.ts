import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/repositories/dashboard";

export async function GET() {
  const session = await getServerSession(authOptions);
  const stats = await getDashboardStats(session?.user?.id);
  return Response.json({ stats });
}
