import { z } from "zod";

const assistantProviderSchema = z.enum(["mock", "openai-compatible"]).default("mock");

const booleanEnv = z.preprocess((value) => value === true || value === "true" || value === "1", z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  ASSISTANT_PROVIDER: assistantProviderSchema,
  OPENAI_COMPATIBLE_API_KEY: z.string().optional(),
  OPENAI_COMPATIBLE_BASE_URL: z.string().url().default("https://api.openai.com/v1"),
  OPENAI_COMPATIBLE_MODEL: z.string().min(1).default("gpt-4.1-mini"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).max(3_600_000).default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).max(10_000).default(60),
  RUNNER_PROVIDER: z.enum(["mock", "remote"]).default("mock"),
  RUNNER_SERVICE_URL: z.string().url().optional(),
  RUNNER_JOB_SECRET: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  GENCODE_STRICT_ENV: booleanEnv.default(false)
});

export type ServerEnv = z.infer<typeof envSchema>;

function isWeakProductionSecret(secret?: string) {
  if (!secret || secret.length < 32) return true;
  return /change|replace|development|local|secret/i.test(secret);
}

export function validateServerEnv(input: NodeJS.ProcessEnv = process.env, options: { strict?: boolean } = {}) {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid Gencode environment: ${parsed.error.issues.map((issue) => issue.message).join("; ")}`);
  }

  const env = parsed.data;
  const strict = options.strict ?? env.GENCODE_STRICT_ENV;
  const production = env.NODE_ENV === "production";

  if ((strict || production) && !env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for production Gencode deployments.");
  }

  if ((strict || production) && isWeakProductionSecret(env.NEXTAUTH_SECRET)) {
    throw new Error("NEXTAUTH_SECRET must be a strong random value of at least 32 characters in production.");
  }

  if (env.ASSISTANT_PROVIDER === "openai-compatible" && !env.OPENAI_COMPATIBLE_API_KEY) {
    throw new Error("OPENAI_COMPATIBLE_API_KEY is required when ASSISTANT_PROVIDER=openai-compatible.");
  }

  if (env.RUNNER_PROVIDER === "remote" && (!env.RUNNER_SERVICE_URL || !env.RUNNER_JOB_SECRET)) {
    throw new Error("RUNNER_SERVICE_URL and RUNNER_JOB_SECRET are required when RUNNER_PROVIDER=remote.");
  }

  return env;
}

let cachedEnv: ServerEnv | null = null;

export function getServerEnv() {
  cachedEnv ??= validateServerEnv(process.env, { strict: process.env.GENCODE_STRICT_ENV === "true" });
  return cachedEnv;
}
