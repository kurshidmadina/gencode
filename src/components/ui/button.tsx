import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-sm font-black transition duration-200 before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 before:transition before:duration-500 hover:before:translate-x-full hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-glow disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-cyan-300 via-cyan-100 to-lime-200 text-slate-950 shadow-[0_0_34px_rgba(96,243,255,0.26)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-px",
        secondary:
          "arena-border bg-white/8 text-white hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/14 active:translate-y-px",
        ghost: "text-slate-200 hover:bg-white/10 hover:text-white",
        danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:-translate-y-0.5 hover:brightness-110",
        gold: "bg-gradient-to-r from-yellow-200 to-amber-300 text-slate-950 shadow-[0_0_30px_rgba(255,209,102,0.2)] hover:-translate-y-0.5 hover:brightness-110"
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
