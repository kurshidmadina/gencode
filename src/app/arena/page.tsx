import { AppFrame } from "@/components/layout/app-frame";
import { ArenaClient } from "@/components/arena/arena-client";
import { Badge } from "@/components/ui/badge";
import { challengeCatalog } from "@/lib/game/challenge-data";

export const metadata = {
  title: "Arena Mode"
};

export default function ArenaPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="gold">Timed competitive practice</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Arena Mode</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Pick a sprint, draw relevant missions, and train accuracy under time pressure. The production model stores runs, scores, and arena ladder entries.
          </p>
        </section>
        <ArenaClient challenges={challengeCatalog} />
      </main>
    </AppFrame>
  );
}
