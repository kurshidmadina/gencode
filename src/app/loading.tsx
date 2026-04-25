export default function Loading() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-4">
      <div className="holo-panel grid w-full max-w-xl gap-4 rounded-lg p-6 shadow-neon">
        <div className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100">Loading arena systems</div>
        <div className="h-4 w-32 animate-pulse rounded bg-cyan-300/35" />
        <div className="h-8 w-3/4 animate-pulse rounded bg-white/12" />
        <div className="grid gap-2">
          <div className="h-3 animate-pulse rounded bg-white/8" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/8" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/8" />
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 to-lime-200" />
        </div>
      </div>
    </main>
  );
}
