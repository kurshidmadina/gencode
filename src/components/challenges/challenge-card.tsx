import Link from "next/link";
import { ArrowRight, Coins, Lock, Play, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedChallenge, ProgressStatus } from "@/lib/game/types";

const difficultyVariant = {
  EASY: "lime",
  MEDIUM: "cyan",
  HARD: "gold",
  EXTREME: "pink",
  INSANE: "red"
} as const;

export function ChallengeCard({
  challenge,
  status = "NOT_STARTED",
  locked = false,
  lockReason
}: {
  challenge: GeneratedChallenge;
  status?: ProgressStatus;
  locked?: boolean;
  lockReason?: string;
}) {
  const card = (
    <Card className={`group h-full transition ${locked ? "border-white/8 bg-slate-950/70 opacity-80" : "hover:border-cyan-300/40 hover:bg-slate-900/82 hover:shadow-neon"}`}>
        <CardHeader>
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge variant={difficultyVariant[challenge.difficulty]}>{challenge.difficulty}</Badge>
            <span className="flex items-center gap-1 rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2 py-1 text-xs font-black text-yellow-100">
              <Star className="h-3.5 w-3.5" />
              {challenge.xpReward} XP
            </span>
          </div>
          <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cyan-300 via-lime-200 to-yellow-200 transition-all duration-300 group-hover:w-28" />
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="line-clamp-3 text-sm leading-6 text-slate-300">{challenge.description}</p>
          <div className="rounded-md border border-lime-300/20 bg-lime-300/10 p-3 text-xs leading-5 text-lime-50">
            <span className="font-black uppercase tracking-[0.18em] text-lime-100">Objective</span>
            <p className="mt-1 line-clamp-2">{challenge.learningObjective}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan">{challenge.categorySlug}</Badge>
            {challenge.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="slate">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="stat-tile rounded-md p-2">
              <div className="text-slate-500">Time</div>
              <div className="mt-1 font-black text-slate-100">{challenge.estimatedTime}m</div>
            </div>
            <div className="stat-tile rounded-md p-2">
              <div className="text-slate-500">Coins</div>
              <div className="mt-1 flex items-center gap-1 font-black text-yellow-100">
                <Coins className="h-3.5 w-3.5" />
                {challenge.coinReward}
              </div>
            </div>
            <div className="stat-tile rounded-md p-2">
              <div className="text-slate-500">Type</div>
              <div className="mt-1 truncate font-black text-slate-100">{challenge.type.replaceAll("_", " ")}</div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1 text-lime-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Safe judge
            </span>
            <span className="flex items-center gap-1 text-cyan-100">
              {locked ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {locked ? "Preview locked" : status.replaceAll("_", " ")}
            </span>
          </div>
          {locked ? <p className="text-xs leading-5 text-yellow-100">{lockReason ?? "Clear prerequisite missions to unlock this card."}</p> : null}
          <div className="flex items-center justify-between text-sm font-black text-white">
            <span>{locked ? "Unlock route first" : "Enter mission"}</span>
            <ArrowRight className="h-4 w-4 text-cyan-100 transition group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
  );

  if (locked) {
    return <div aria-disabled="true">{card}</div>;
  }

  return (
    <Link href={`/challenges/${challenge.slug}`}>
      {card}
    </Link>
  );
}
