import type { Prisma } from "@prisma/client";
import { pricingPlans } from "@/lib/billing/plans";
import { getStripePriceId } from "@/lib/billing/stripe";
import { prisma } from "@/lib/prisma";

function asJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function syncSubscriptionPlans(client: Pick<typeof prisma, "subscriptionPlan"> = prisma) {
  for (const plan of pricingPlans) {
    await client.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: {
        slug: plan.slug,
        name: plan.displayName,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        currency: plan.currency,
        stripeMonthlyPriceId: plan.id === "free" || plan.id === "enterprise" ? null : getStripePriceId(plan.id, "monthly"),
        stripeYearlyPriceId: plan.id === "free" || plan.id === "enterprise" ? null : getStripePriceId(plan.id, "yearly"),
        active: true,
        metadata: asJson({
          targetAudience: plan.targetAudience,
          entitlements: plan.entitlements,
          features: plan.features,
          unavailableFeatures: plan.unavailableFeatures
        })
      },
      create: {
        id: plan.id,
        slug: plan.slug,
        name: plan.displayName,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        currency: plan.currency,
        stripeMonthlyPriceId: plan.id === "free" || plan.id === "enterprise" ? null : getStripePriceId(plan.id, "monthly"),
        stripeYearlyPriceId: plan.id === "free" || plan.id === "enterprise" ? null : getStripePriceId(plan.id, "yearly"),
        active: true,
        metadata: asJson({
          targetAudience: plan.targetAudience,
          entitlements: plan.entitlements,
          features: plan.features,
          unavailableFeatures: plan.unavailableFeatures
        })
      }
    });
  }
}
