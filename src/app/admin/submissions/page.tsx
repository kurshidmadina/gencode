import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canReachDatabase } from "@/lib/db-health";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Submissions"
};

async function getSubmissions() {
  if (!(await canReachDatabase())) return [];
  return prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      user: { select: { username: true, email: true } },
      challenge: { include: { category: true } }
    }
  });
}

export default async function AdminSubmissionsPage() {
  await requireAdmin();
  const submissions = await getSubmissions();

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="cyan">Judge telemetry</Badge>
          <h1 className="mt-3 text-4xl font-black text-white">Submission Review</h1>
          <p className="mt-2 text-slate-400">Recent attempts, scores, runtime, memory, and failure concentration.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest Submissions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-400">No submissions have been recorded yet.</p>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="grid gap-3 rounded-md border border-white/10 bg-white/6 p-4 lg:grid-cols-[1fr_160px_120px_120px_150px]">
                  <div>
                    <div className="font-bold text-white">{submission.challenge.title}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      @{submission.user.username ?? submission.user.email ?? "unknown"} / {submission.challenge.category.slug}
                    </div>
                  </div>
                  <Badge variant={submission.status === "PASSED" ? "lime" : submission.status === "PARTIAL" ? "gold" : "red"}>
                    {submission.status}
                  </Badge>
                  <div className="text-sm text-slate-300">{submission.score}% score</div>
                  <div className="text-sm text-slate-300">{submission.runtime ?? 0} ms</div>
                  <div className="text-sm text-slate-300">{submission.createdAt.toLocaleString()}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </AppFrame>
  );
}
