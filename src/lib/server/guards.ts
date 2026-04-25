import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions, isAdmin } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  if (!session?.user) redirect("/login");
  if (!isAdmin(session)) notFound();
  return session;
}
