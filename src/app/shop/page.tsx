import { getServerSession } from "next-auth";
import { AppFrame } from "@/components/layout/app-frame";
import { ShopClient } from "@/components/shop/shop-client";
import { Badge } from "@/components/ui/badge";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { shopItems } from "@/lib/game/shop";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Reward Shop"
};

export default async function ShopPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const dbReady = await canReachDatabase();
  const user = session?.user?.id && dbReady ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { coins: true } }) : null;

  return (
    <AppFrame>
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="holo-panel rounded-lg p-7 shadow-neon">
          <Badge variant="gold">Cosmetic reward shop</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Spend coins on identity, not power.</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Profile frames, terminal themes, title labels, and badge glows let your training history feel visible without changing challenge fairness.
          </p>
        </section>
        <ShopClient items={shopItems} initialCoins={user?.coins ?? 410} />
      </main>
    </AppFrame>
  );
}
