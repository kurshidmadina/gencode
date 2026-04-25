import { Progress } from "@/components/ui/progress";

export function UsageMeter({
  label,
  used,
  limit,
  helper
}: {
  label: string;
  used: number;
  limit: number | null;
  helper?: string;
}) {
  const percent = limit === null ? 100 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className="grid gap-2 rounded-md border border-white/10 bg-white/6 p-3">
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-200">
        <span>{label}</span>
        <span className="text-cyan-100">{limit === null ? `${used} used` : `${used}/${limit}`}</span>
      </div>
      <Progress value={percent} indicatorClassName={limit === null ? "bg-arena-glow" : percent > 85 ? "bg-arena-gold" : undefined} />
      {helper ? <p className="text-xs leading-5 text-slate-400">{helper}</p> : null}
    </div>
  );
}
