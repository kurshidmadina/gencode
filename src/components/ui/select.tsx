import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-cyan-300/18 bg-slate-950/82 px-3 text-sm text-white shadow-inner outline-none transition hover:border-cyan-300/35 focus:border-arena-glow focus:ring-2 focus:ring-arena-glow/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";
