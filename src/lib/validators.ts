import { z } from "zod";
import { assistantModes } from "@/lib/assistant/modes";
import { challengeTypes, difficulties } from "@/lib/game/types";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only."),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain a letter.")
    .regex(/[0-9]/, "Password must contain a number.")
});

export const challengeFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  tag: z.string().optional(),
  minXp: z.string().optional(),
  maxXp: z.string().optional()
});

export const challengeQuerySchema = challengeFilterSchema.extend({
  page: z.coerce.number().int().min(1).max(500).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(48)
});

export const leaderboardQuerySchema = z.object({
  scope: z.enum(["global", "weekly", "monthly", "category", "difficulty"]).default("global"),
  category: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80)
    .optional(),
  difficulty: z.enum(difficulties).optional()
});

export const runSubmissionSchema = z.object({
  answer: z.string().max(100_000),
  mode: z.enum(["run", "submit"]).default("run")
});

export const hintRequestSchema = z.object({
  hintIndex: z.number().int().min(0).max(10).default(0)
});

export const assistantMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(4000),
  mode: z.enum(assistantModes).default("mentor"),
  challengeSlug: z.string().optional(),
  hintLevel: z.number().int().min(1).max(5).optional(),
  currentCode: z.string().max(100_000).optional(),
  failedTests: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        passed: z.boolean().optional(),
        message: z.string().max(1000).optional(),
        expected: z.string().max(1000).optional(),
        actual: z.string().max(1000).optional()
      })
    )
    .max(10)
    .optional(),
  attempts: z.number().int().min(0).max(200).optional(),
  hintUsage: z.number().int().min(0).max(50).optional(),
  allowSolution: z.boolean().optional(),
  completed: z.boolean().optional(),
  voice: z.boolean().optional(),
  context: z.record(z.unknown()).optional()
});

const slugSchema = z
  .string()
  .min(4)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase URL-safe slugs.");

export const challengeCreateSchema = z.object({
  title: z.string().min(4).max(140),
  slug: slugSchema,
  subtitle: z.string().max(180).optional(),
  description: z.string().min(20),
  story: z.string().min(20),
  learningObjective: z.string().min(20).max(1000).optional(),
  instructions: z.string().min(20),
  categoryId: z.string().min(8),
  difficulty: z.enum(difficulties),
  type: z.enum(challengeTypes),
  tags: z.array(z.string().min(1).max(32)).max(12).default([]),
  xpReward: z.number().int().min(1).max(5000),
  coinReward: z.number().int().min(0).max(5000),
  estimatedTime: z.number().int().min(1).max(240),
  starterCode: z.string().max(50_000).optional(),
  language: z.string().max(40).optional(),
  hints: z.array(z.string().min(5).max(300)).max(5).default([]),
  solution: z.string().max(50_000).optional(),
  explanation: z.string().min(20).max(10_000).optional(),
  examples: z.array(z.record(z.unknown())).max(8).optional(),
  validationMetadata: z.record(z.unknown()).optional(),
  relatedChallenges: z.array(z.string().min(4).max(180)).max(12).optional(),
  successCriteria: z.array(z.string().min(5).max(240)).max(8).optional()
});

export const challengeUpdateSchema = challengeCreateSchema.partial().extend({
  featured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]).optional()
});

export const profileSettingsSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  favoriteCategories: z.array(z.string().min(2).max(40)).max(8).default([]),
  genieMode: z.enum(["mentor", "interviewer", "coach", "debugging", "concept", "explain", "hint", "socratic"]).default("mentor"),
  publicProfile: z.boolean().default(true)
});
