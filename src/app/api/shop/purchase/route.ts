import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { canReachDatabase } from "@/lib/db-health";
import { getShopItem } from "@/lib/game/shop";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

const purchaseSchema = z.object({
  slug: z.string().min(2).max(80)
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ error: "Login required to buy cosmetics." }, { status: 401 });
  const limit = rateLimit(`shop:${session.user.id}:${getClientIp(request)}`, 20);
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = purchaseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid shop item." }, { status: 400 });

  const localItem = getShopItem(parsed.data.slug);
  if (!localItem) return Response.json({ error: "Unknown cosmetic." }, { status: 404 });

  if (!(await canReachDatabase())) {
    return Response.json({ error: "Database is not reachable. Purchases need persistent inventory." }, { status: 503 });
  }

  const item = await prisma.shopItem.upsert({
    where: { slug: localItem.slug },
    update: {
      name: localItem.name,
      description: localItem.description,
      type: localItem.type,
      rarity: localItem.rarity,
      price: localItem.price,
      metadata: localItem.metadata as Prisma.InputJsonValue
    },
    create: {
      slug: localItem.slug,
      name: localItem.name,
      description: localItem.description,
      type: localItem.type,
      rarity: localItem.rarity,
      price: localItem.price,
      metadata: localItem.metadata as Prisma.InputJsonValue
    }
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { coins: true }
  });
  if (!user) return Response.json({ error: "User not found." }, { status: 404 });

  const existing = await prisma.userInventory.findUnique({
    where: { userId_shopItemId: { userId: session.user.id, shopItemId: item.id } }
  });
  if (existing) return Response.json({ owned: true, coins: user.coins });
  if (user.coins < item.price) return Response.json({ error: "Not enough coins for this cosmetic." }, { status: 400 });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.userInventory.create({
      data: { userId: session.user.id, shopItemId: item.id }
    });
    await tx.coinTransaction.create({
      data: {
        userId: session.user.id,
        amount: -item.price,
        reason: "shop.purchase",
        metadata: { itemSlug: item.slug }
      }
    });
    return tx.user.update({
      where: { id: session.user.id },
      data: { coins: { decrement: item.price } },
      select: { coins: true }
    });
  });

  return Response.json({ owned: true, coins: updated.coins });
}
