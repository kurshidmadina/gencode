import Link from "next/link";
import { getServerSession } from "next-auth";
import { Code2, CreditCard, Gauge, LogIn, Map, Route, Shield, ShoppingBag, Sparkles, Swords, Trophy, UserRound, Users, WandSparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/demo", label: "Demo", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/challenges", label: "Challenges", icon: Code2 },
  { href: "/paths", label: "Paths", icon: Route },
  { href: "/boss-battles", label: "Bosses", icon: Swords },
  { href: "/arena", label: "Arena", icon: Trophy },
  { href: "/map", label: "Map", icon: Map },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/vr", label: "VR", icon: WandSparkles },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/team", label: "Team", icon: Users }
];

export async function SiteNav() {
  const session = await getServerSession(authOptions).catch(() => null);
  const mobileLinks = session?.user?.role === "ADMIN" ? [...links, { href: "/admin", label: "Admin", icon: Shield }] : links;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cyan-300/15 bg-slate-950/82 shadow-[0_8px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Gencode home">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-cyan-200 via-lime-200 to-yellow-200 text-slate-950 shadow-neon">
              <Code2 className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-black tracking-[0.22em] text-white">GENCODE</span>
              <span className="-mt-1 hidden text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/70 sm:block">technical RPG arena</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-rail-link inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-slate-300 transition hover:bg-cyan-300/10 hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-glow"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-yellow-100 transition hover:bg-yellow-300/10"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="flex items-center gap-2">
            {session?.user ? (
              <Button asChild variant="secondary" size="sm">
                <Link href="/profile">
                  <UserRound className="h-4 w-4" />
                  {session.user.username ?? session.user.name ?? "Profile"}
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild size="sm" variant="secondary" className="hidden sm:inline-flex">
                  <Link href="/demo">Demo Flow</Link>
                </Button>
                <Button asChild size="sm">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-3 bottom-3 z-40 flex gap-1 overflow-x-auto rounded-lg border border-cyan-300/20 bg-slate-950/92 p-1 shadow-[0_18px_70px_rgba(0,0,0,0.48)] backdrop-blur-xl md:hidden" aria-label="Mobile primary navigation">
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="grid min-h-12 min-w-[72px] place-items-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-glow"
          >
            <link.icon className="h-4 w-4 text-cyan-100" />
            <span className="max-w-full truncate">{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
