import type { Prisma } from "@prisma/client";
import { canReachDatabase } from "@/lib/db-health";
import { logWarn } from "@/lib/observability/logger";
import { prisma } from "@/lib/prisma";

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

export async function recordUsageEvent({
  userId,
  event,
  entityType,
  entityId,
  metadata
}: {
  userId?: string | null;
  event: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: unknown;
}) {
  if (!(await canReachDatabase())) return;
  try {
    await prisma.usageEvent.create({
      data: {
        userId: userId ?? null,
        event,
        entityType: entityType ?? null,
        entityId: entityId ?? null,
        metadata: toJson(metadata)
      }
    });
  } catch (error) {
    logWarn("usage_event.persist_failed", { event, entityType, entityId, error: error instanceof Error ? error.message : String(error) });
  }
}

export async function recordSubmissionAudit({
  userId,
  submissionId,
  action,
  metadata
}: {
  userId?: string | null;
  submissionId?: string | null;
  action: string;
  metadata?: unknown;
}) {
  if (!(await canReachDatabase())) return;
  try {
    await prisma.submissionAuditLog.create({
      data: {
        userId: userId ?? null,
        submissionId: submissionId ?? null,
        action,
        metadata: toJson(metadata)
      }
    });
  } catch (error) {
    logWarn("submission_audit.persist_failed", { action, submissionId, error: error instanceof Error ? error.message : String(error) });
  }
}

