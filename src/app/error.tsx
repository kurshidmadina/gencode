"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 text-center">
      <div className="arena-border arena-card max-w-lg rounded-lg border-red-300/25 bg-red-400/10 p-8 shadow-[0_18px_70px_rgba(239,68,68,0.12)]">
        <div className="text-sm font-bold uppercase tracking-[0.2em] text-red-100">Arena fault</div>
        <h1 className="mt-3 text-3xl font-black text-white">Something broke in this mission room.</h1>
        <p className="mt-3 leading-7 text-slate-300">The app caught the fault before it became a silent failure. Retry the room and keep the training loop alive.</p>
        <Button type="button" className="mt-6" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </main>
  );
}
