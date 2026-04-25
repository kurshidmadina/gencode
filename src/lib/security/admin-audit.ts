import type { Prisma } from "@prisma/client";
import { canReachDatabase } from "@/lib/db-health";
import { logWarn } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

export async function recordAdminAudit({
  actorId,
  action,
  target,
  targetId,
  metadata
}: {
  actorId?: string | null;
  action: string;
  target: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  if (!(await canReachDatabase())) return;
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        target,
        targetId: targetId ?? null,
        metadata
      }
    });
  } catch (error) {
    logWarn("admin_audit.persist_failed", { action, target, targetId, error: error instanceof Error ? error.message : String(error) });
    // Audit logging should not make the primary admin action fail.
  }
}
