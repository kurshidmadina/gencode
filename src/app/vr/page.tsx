import { getServerSession } from "next-auth";
import { AppFrame } from "@/components/layout/app-frame";
import { VRExperience } from "@/components/vr/vr-experience";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { listChallenges } from "@/lib/repositories/challenges";
import { getDashboardStats } from "@/lib/repositories/dashboard";

export const metadata = {
  title: "VR Mode"
};

export default async function VRPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const stats = await getDashboardStats(session?.user?.id);
  const challenges = await listChallenges();
  const activeChallenge = challenges.find((challenge) => challenge.featured) ?? challenges[0];
  const nextChallenge = challenges.find((challenge) => challenge.slug !== activeChallenge?.slug);
  const progress = {
    rank: stats.rank,
    level: stats.level,
    xp: stats.xp,
    coins: stats.coins,
    streak: stats.streak,
    levelProgress: stats.levelProgress,
    completed: stats.completed
  };

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="cyan">WebXR + fallback 3D</Badge>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Convert to VR</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            Enter a headset-ready coding room with floating mission panels, speech commands, speech output, and Genie in short-form mentor mode.
          </p>
        </div>
        <VRExperience challenge={activeChallenge} nextSlug={nextChallenge?.slug} progress={progress} />
      </main>
    </AppFrame>
  );
}
