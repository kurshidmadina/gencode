"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Coins, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ShopItemDefinition } from "@/lib/game/shop";

export function ShopClient({ items, initialCoins }: { items: ShopItemDefinition[]; initialCoins: number }) {
  const [coins, setCoins] = useState(initialCoins);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function purchase(slug: string) {
    setLoading(slug);
    const response = await fetch("/api/shop/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    });
    const data = (await response.json().catch(() => null)) as { coins?: number; owned?: boolean; error?: string } | null;
    setLoading(null);
    if (!response.ok) {
      toast.error(data?.error ?? "Purchase failed.");
      return;
    }
    setOwned((current) => [...new Set([...current, slug])]);
    if (typeof data?.coins === "number") setCoins(data.coins);
    toast.success("Cosmetic unlocked.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-200" />
            Coin vault
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black text-yellow-100">{coins}</div>
          <p className="mt-2 text-sm leading-6 text-slate-400">Coins buy identity, not advantage. No pay-to-win stats live here.</p>
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const canBuy = coins >= item.price && !owned.includes(item.slug);
          return (
            <Card key={item.slug} className="transition hover:-translate-y-1 hover:border-cyan-300/35">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={item.rarity === "legendary" ? "gold" : item.rarity === "epic" ? "cyan" : "slate"}>{item.rarity}</Badge>
                  <Badge variant="slate">{item.type}</Badge>
                </div>
                <CardTitle>{item.name}</CardTitle>
                <p className="text-sm leading-6 text-slate-400">{item.description}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid h-24 place-items-center rounded-md border border-white/10 bg-gradient-to-br from-cyan-300/10 via-slate-950 to-pink-300/10">
                  <Sparkles className="h-8 w-8 text-cyan-100" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-300">Price</span>
                  <span className="font-black text-yellow-100">{item.price} coins</span>
                </div>
                <Button type="button" variant={canBuy ? "primary" : "secondary"} disabled={!canBuy || loading === item.slug} onClick={() => purchase(item.slug)}>
                  {owned.includes(item.slug) ? "Owned" : loading === item.slug ? "Unlocking..." : "Unlock Cosmetic"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
