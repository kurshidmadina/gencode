import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Users"
};

async function getUsers() {
  if (!(await canReachDatabase())) {
    return [
      { id: "demo-admin", username: "arena_admin", email: "admin@gencode.dev", role: "ADMIN", xp: 21840, streak: 31, createdAt: new Date(), lastActiveAt: new Date(), _count: { submissions: 86, progress: 74 } },
      { id: "demo-user", username: "nova_cli", email: "demo@gencode.dev", role: "USER", xp: 7420, streak: 9, createdAt: new Date(), lastActiveAt: new Date(), _count: { submissions: 42, progress: 34 } }
    ];
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: 50,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        xp: true,
        streak: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            submissions: true,
            progress: { where: { status: "COMPLETED" } }
          }
        }
      }
    });
    if (users.length > 0) return users;
  } catch {
    // Static fallback.
  }
  return [
    { id: "demo-admin", username: "arena_admin", email: "admin@gencode.dev", role: "ADMIN", xp: 21840, streak: 31, createdAt: new Date(), lastActiveAt: new Date(), _count: { submissions: 86, progress: 74 } },
    { id: "demo-user", username: "nova_cli", email: "demo@gencode.dev", role: "USER", xp: 7420, streak: 9, createdAt: new Date(), lastActiveAt: new Date(), _count: { submissions: 42, progress: 34 } }
  ];
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getUsers();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="cyan">Operator safety and progression</Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Manage Users</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Review roles, learning progress, activity, and submission volume before taking account-level action.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {users.map((user) => (
              <div key={user.id} className="grid gap-3 rounded-md border border-white/10 bg-white/6 p-4 lg:grid-cols-[1.2fr_1fr_90px_90px_120px_150px]">
                <div>
                  <Link href={`/profile/${user.username ?? ""}`} className="font-bold text-white hover:text-cyan-100">
                    @{user.username ?? "anonymous"}
                  </Link>
                  <div className="mt-1 text-sm text-slate-400">{user.email}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={user.role === "ADMIN" ? "gold" : "slate"}>{user.role}</Badge>
                  <span className="text-sm text-yellow-100">{user.xp} XP</span>
                </div>
                <span className="text-sm text-slate-300">{user.streak} streak</span>
                <span className="text-sm text-slate-300">{user._count.progress} clears</span>
                <span className="text-sm text-slate-300">{user._count.submissions} attempts</span>
                <span className="text-sm text-slate-400">
                  {user.lastActiveAt ? `Active ${user.lastActiveAt.toLocaleDateString()}` : `Joined ${user.createdAt.toLocaleDateString()}`}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
