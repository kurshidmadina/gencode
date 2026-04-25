import { z } from "zod";

export const checkoutSessionSchema = z.object({
  planId: z.enum(["starter", "pro", "elite", "team"]),
  billingInterval: z.enum(["monthly", "yearly"]),
  teamSeats: z.number().int().min(3).max(500).optional()
});

export const salesLeadSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  organization: z.string().max(160).optional(),
  teamSize: z.coerce.number().int().min(1).max(100_000).optional(),
  useCase: z.string().min(3).max(120),
  message: z.string().min(10).max(2_000),
  source: z.string().max(80).default("contact-sales")
});
