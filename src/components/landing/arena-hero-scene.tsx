const codeRails = [
  "linux.logins.filter --burst=5m",
  "sql.detect_duplicate_payments()",
  "dsa.graph.shortest_path.trace",
  "git.recover_lost_commit --safe",
];

const portalLabels = ["Linux", "SQL", "DSA", "Debug"];

export function ArenaHeroScene() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/15 via-slate-950/72 to-slate-950" />
      <div className="absolute inset-x-0 top-20 mx-auto h-[440px] max-w-6xl rounded-full border border-cyan-300/10 opacity-70 [transform:perspective(900px)_rotateX(64deg)]">
        <div className="absolute inset-8 rounded-full border border-yellow-200/10" />
        <div className="absolute inset-20 rounded-full border border-pink-300/10" />
        <div className="absolute inset-32 rounded-full border border-cyan-200/20" />
      </div>

      <div className="absolute left-[3%] top-[10%] hidden w-72 rounded-lg border border-cyan-300/18 bg-slate-950/62 p-4 shadow-neon backdrop-blur-xl 2xl:block">
        <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100">
          <span>Arena Feed</span>
          <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-emerald-100">Live</span>
        </div>
        <div className="space-y-2 font-mono text-[11px] text-slate-300">
          {codeRails.map((rail) => (
            <div key={rail} className="rounded border border-white/8 bg-white/5 px-3 py-2">
              <span className="text-cyan-100">&gt;</span> {rail}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-[3%] top-[12%] hidden w-80 rounded-lg border border-yellow-200/18 bg-slate-950/62 p-4 shadow-[0_24px_90px_rgba(250,204,21,0.12)] backdrop-blur-xl 2xl:block">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-yellow-100">Unlock Matrix</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {portalLabels.map((label, index) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/6 p-3">
              <div className="text-xs font-black text-white">{label}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-yellow-200"
                  style={{ width: `${74 - index * 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-1/2 h-[44rem] w-[88rem] -translate-x-1/2 translate-y-1/2 opacity-70 [background:linear-gradient(90deg,rgba(96,243,255,0.18)_1px,transparent_1px),linear-gradient(rgba(96,243,255,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_top,black,transparent_75%)] [transform:translateX(-50%)_translateY(50%)_perspective(760px)_rotateX(64deg)]" />
      <div className="scanline absolute inset-0 opacity-20" />
    </div>
  );
}
