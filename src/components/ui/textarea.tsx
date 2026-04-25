import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-md border border-cyan-300/18 bg-slate-950/82 px-3 py-3 text-sm text-white shadow-inner outline-none transition placeholder:text-slate-500 hover:border-cyan-300/35 focus:border-arena-glow focus:ring-2 focus:ring-arena-glow/20",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
