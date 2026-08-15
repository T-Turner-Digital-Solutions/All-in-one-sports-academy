import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AuditArgs = {
  actorId?: string | null;
  action: string;
  recordType: string;
  recordId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
};

export async function logAudit({ actorId, action, recordType, recordId, before, after }: AuditArgs) {
  return prisma.auditLog.create({
    data: {
      actorId: actorId ?? undefined,
      action,
      recordType,
      recordId,
      beforeValue: before ?? undefined,
      afterValue: after ?? undefined,
    },
  });
}
