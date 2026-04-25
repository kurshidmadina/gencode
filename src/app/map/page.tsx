import Link from "next/link";
import { Lock, MapPinned, Swords } from "lucide-react";
import { AppFrame } from "@/components/layout/app-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { worldZones } from "@/lib/game/world-map";

export const metadata = {
  title: "Academy Map"
};

export default function AcademyMapPage() {
  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="cyan">Academy world map</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">See your technical world at a glance.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Gencode’s map turns categories into zones, paths into routes, and boss battles into destination gates.
          </p>
        </section>
        <section className="relative min-h-[620px] overflow-hidden rounded-lg border border-cyan-300/15 bg-[radial-gradient(circle_at_20%_20%,rgba(96,243,255,0.18),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(232,121,249,0.16),transparent_28%),linear-gradient(135deg,#020617,#0f172a_52%,#111827)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(96,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(96,243,255,0.05)_1px,transparent_1px)] bg-[size:42px_42px]" />
          {worldZones.map((zone) => (
            <Link
              key={zone.slug}
              href={zone.href}
              className={`absolute z-10 w-48 -translate-x-1/2 -translate-y-1/2 rounded-lg border p-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-[54%] hover:scale-[1.02] ${
                zone.state === "legendary"
                  ? "border-pink-300/40 bg-pink-300/12"
                  : zone.state === "boss"
                    ? "border-yellow-300/40 bg-yellow-300/12"
                    : "border-cyan-300/25 bg-slate-950/78"
              }`}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            >
              <div className="mb-2 flex items-center gap-2">
                {zone.state === "boss" ? <Swords className="h-4 w-4 text-yellow-200" /> : zone.state === "legendary" ? <Lock className="h-4 w-4 text-pink-200" /> : <MapPinned className="h-4 w-4 text-cyan-200" />}
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{zone.state}</span>
              </div>
              <div className="font-black text-white">{zone.name}</div>
              <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">{zone.description}</p>
            </Link>
          ))}
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {worldZones.map((zone) => (
            <Card key={zone.slug}>
              <CardHeader>
                <CardTitle>{zone.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-slate-400">
                <p>{zone.description}</p>
                <div className="flex flex-wrap gap-2">
                  {zone.categorySlugs.map((category) => (
                    <Badge key={category} variant="slate">{category}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </AppFrame>
  );
}
