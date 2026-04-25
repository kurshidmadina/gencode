import { AppFrame } from "@/components/layout/app-frame";
import { ChallengeManager } from "@/components/admin/challenge-manager";
import { listCategories, listChallenges } from "@/lib/repositories/challenges";
import { categories as staticCategories } from "@/lib/game/types";
import { requireAdmin } from "@/lib/server/guards";

export const metadata = {
  title: "Admin Challenges"
};

export default async function AdminChallengesPage() {
  await requireAdmin();
  const challenges = await listChallenges();
  const dbCategories = await listCategories();
  const categories =
    dbCategories?.map((category) => ({ id: category.id, name: category.name, slug: category.slug })) ??
    staticCategories.map((category) => ({ id: "", name: category.name, slug: category.slug }));

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="holo-panel rounded-lg p-6">
          <h1 className="text-4xl font-black text-white">Manage Challenges</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Curate the mission library, feature high-signal challenges, and remove weak content before it reaches the arena.
          </p>
        </div>
        <ChallengeManager challenges={challenges} categories={categories} />
      </main>
    </AppFrame>
  );
}
