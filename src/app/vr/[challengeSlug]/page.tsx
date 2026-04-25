import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { AppFrame } from "@/components/layout/app-frame";
import { VRExperience } from "@/components/vr/vr-experience";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { challengeCatalog } from "@/lib/game/challenge-data";
import { findChallenge } from "@/lib/repositories/challenges";
import { getDashboardStats } from "@/lib/repositories/dashboard";

type PageProps = {
  params: Promise<{ challengeSlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { challengeSlug } = await params;
  const challenge = await findChallenge(challengeSlug);
  return {
    title: challenge ? `Immersive ${challenge.title}` : "Immersive Mode"
  };
}

export default async function ChallengeVRPage({ params }: PageProps) {
  const { challengeSlug } = await params;
  const session = await getServerSession(authOptions).catch(() => null);
  const stats = await getDashboardStats(session?.user?.id);
  const challenge = await findChallenge(challengeSlug);
  if (!challenge) notFound();
  const index = challengeCatalog.findIndex((item) => item.slug === challenge.slug);
  const nextSlug = index >= 0 ? challengeCatalog[index + 1]?.slug : undefined;
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
          <Badge variant="cyan">challenge-specific immersive room</Badge>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{challenge.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-400">
            A focused WebXR-ready arena for this mission, with spoken commands, real safe-judge controls, Genie voice coaching, and fallback 3D for normal browsers.
          </p>
        </div>
        <VRExperience challenge={challenge} nextSlug={nextSlug} progress={progress} />
      </main>
    </AppFrame>
  );
}
