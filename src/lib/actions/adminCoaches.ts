"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Role, CompensationType, CoachStatus } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const compSchema = z.object({
  coachId: z.string().min(1),
  compensationType: z.nativeEnum(CompensationType),
  flatAmountCents: z.coerce.number().int().min(0).optional(),
  percentageBps: z.coerce.number().int().min(0).max(10000).optional(),
  hourlyRateCents: z.coerce.number().int().min(0).optional(),
  compensationNotes: z.string().optional(),
});

export async function updateCoachCompensationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const parsed = compSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please check the compensation fields." };
  const { coachId, ...data } = parsed.data;

  const before = await prisma.coach.findUnique({ where: { id: coachId } });
  const updated = await prisma.coach.update({ where: { id: coachId }, data });

  await logAudit({
    actorId: session!.user.id,
    action: "coach.compensation_changed",
    recordType: "Coach",
    recordId: coachId,
    before: { compensationType: before?.compensationType, flatAmountCents: before?.flatAmountCents, percentageBps: before?.percentageBps },
    after: { compensationType: updated.compensationType, flatAmountCents: updated.flatAmountCents, percentageBps: updated.percentageBps },
  });

  revalidatePath(`/admin/coaches/${coachId}`);
  return { success: true };
}

export async function setCoachStatusAction(coachId: string, status: CoachStatus) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const before = await prisma.coach.findUnique({ where: { id: coachId } });
  await prisma.coach.update({ where: { id: coachId }, data: { status } });
  await logAudit({
    actorId: session!.user.id,
    action: "coach.status_changed",
    recordType: "Coach",
    recordId: coachId,
    before: { status: before?.status },
    after: { status },
  });
  revalidatePath(`/admin/coaches/${coachId}`);
  revalidatePath("/admin/coaches");
}

export async function toggleCoachSportAction(coachId: string, sportId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const existing = await prisma.coachSport.findUnique({ where: { coachId_sportId: { coachId, sportId } } });
  if (existing) {
    await prisma.coachSport.delete({ where: { id: existing.id } });
  } else {
    await prisma.coachSport.create({ data: { coachId, sportId } });
  }
  revalidatePath(`/admin/coaches/${coachId}`);
}
