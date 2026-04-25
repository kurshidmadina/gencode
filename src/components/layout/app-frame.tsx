import { SiteNav } from "@/components/layout/site-nav";

export async function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="command-shell min-h-screen pb-24 md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-cyan-300 focus:px-4 focus:py-2 focus:font-black focus:text-slate-950"
      >
        Skip to arena content
      </a>
      <SiteNav />
      <div id="main-content" className="page-enter">
        {children}
      </div>
    </div>
  );
}
