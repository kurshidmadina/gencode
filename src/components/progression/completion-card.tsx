import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CompletionCard({
  title,
  subtitle,
  reward,
  username = "Gencode Operator"
}: {
  title: string;
  subtitle: string;
  reward: string;
  username?: string;
}) {
  return (
    <div className="completion-burst overflow-hidden rounded-lg border border-cyan-300/25 bg-[radial-gradient(circle_at_20%_20%,rgba(96,243,255,0.22),transparent_28%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)] p-5 shadow-neon">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="gold">Shareable clear card</Badge>
          <h3 className="mt-4 text-2xl font-black leading-tight text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-md border border-yellow-300/30 bg-yellow-300/15">
          <Trophy className="h-7 w-7 text-yellow-200" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 rounded-md border border-white/10 bg-black/25 p-4 sm:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Operator</div>
          <div className="mt-1 font-black text-white">{username}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Reward</div>
          <div className="mt-1 font-black text-yellow-100">{reward}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Platform</div>
          <div className="mt-1 font-black text-cyan-100">Gencode</div>
        </div>
      </div>
    </div>
  );
}
