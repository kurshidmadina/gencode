import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
  indicatorClassName
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("h-2 overflow-hidden rounded-full border border-white/10 bg-black/40 shadow-inner", className)}>
      <div
        className={cn(
          "h-full xp-spark rounded-full bg-gradient-to-r from-cyan-300 via-lime-200 to-yellow-200 shadow-[0_0_24px_rgba(96,243,255,0.42)] transition-all duration-700",
          indicatorClassName
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
