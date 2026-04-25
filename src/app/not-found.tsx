import Link from "next/link";
import { AppFrame } from "@/components/layout/app-frame";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppFrame>
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4 text-center">
        <div className="holo-panel max-w-lg rounded-lg p-8 shadow-neon">
          <div className="text-8xl font-black text-cyan-100">404</div>
          <h1 className="mt-4 text-3xl font-black text-white">Arena gate not found</h1>
          <p className="mt-3 text-slate-400">That route is not in the current mission map. Re-enter through the catalog and queue a real room.</p>
          <Button asChild className="mt-6">
            <Link href="/challenges">Back to challenges</Link>
          </Button>
        </div>
      </main>
    </AppFrame>
  );
}
