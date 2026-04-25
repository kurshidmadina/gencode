import { canReachDatabase } from "@/lib/db-health";
import { getServerEnv, validateServerEnv } from "@/lib/env";

export async function GET() {
  let envReady = true;
  let envError: string | null = null;
  try {
    const env = getServerEnv();
    validateServerEnv(process.env, { strict: env.NODE_ENV === "production" && env.GENCODE_STRICT_ENV });
  } catch (error) {
    envReady = false;
    envError = error instanceof Error ? error.message : "Invalid environment";
  }

  const databaseReachable = await canReachDatabase();
  const ok = envReady && databaseReachable;

  return Response.json(
    {
      ok,
      service: "gencode",
      database: databaseReachable ? "reachable" : "unreachable",
      environment: envReady ? "valid" : "invalid",
      error: envReady ? undefined : envError,
      timestamp: new Date().toISOString()
    },
    { status: ok ? 200 : 503 }
  );
}

