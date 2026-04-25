import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "badge-pop inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-[0.14em] shadow-sm",
  {
    variants: {
      variant: {
        cyan: "border-cyan-300/30 bg-cyan-300/10 text-cyan-100",
        gold: "border-yellow-300/30 bg-yellow-300/10 text-yellow-100",
        lime: "border-lime-300/30 bg-lime-300/10 text-lime-100",
        pink: "border-pink-300/30 bg-pink-300/10 text-pink-100",
        violet: "border-violet-300/30 bg-violet-300/10 text-violet-100",
        slate: "border-slate-400/20 bg-slate-400/10 text-slate-200",
        red: "border-red-300/30 bg-red-400/10 text-red-100"
      }
    },
    defaultVariants: {
      variant: "slate"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
