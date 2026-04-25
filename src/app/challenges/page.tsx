import { getServerSession } from "next-auth";
import { AppFrame } from "@/components/layout/app-frame";
import { CatalogClient } from "@/components/challenges/catalog-client";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { getUserChallengeAccessMap } from "@/lib/game/access";
import { listChallenges } from "@/lib/repositories/challenges";

export const metadata = {
  title: "Challenges"
};

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const challenges = await listChallenges();
  const accessBySlug = await getUserChallengeAccessMap(session?.user?.id, challenges);

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <Badge variant="cyan">{challenges.length} active missions</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Mission Catalog</h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Pick a route, clear the gate, and unlock the next tier. Every mission has XP, coins, hints, visible checks, and hidden robustness signals.
          </p>
        </div>
        <CatalogClient challenges={challenges} accessBySlug={accessBySlug} />
      </main>
    </AppFrame>
  );
}
