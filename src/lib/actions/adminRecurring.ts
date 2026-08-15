"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { generateRecurringOccurrences } from "@/lib/recurring";
import { revalidatePath } from "next/cache";
import { Role, RecurrenceFrequency, RecurrenceEndType, RecurringPaymentArrangement } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({
  athleteId: z.string().min(1),
  coachId: z.string().min(1),
  sportId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  frequency: z.nativeEnum(RecurrenceFrequency),
  startDate: z.string().min(1),
  endType: z.nativeEnum(RecurrenceEndType),
  endDate: z.string().optional(),
  numberOfSessions: z.coerce.number().int().min(1).optional(),
  paymentArrangement: z.nativeEnum(RecurringPaymentArrangement),
  notes: z.string().optional(),
});

export async function createRecurringAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete every field." };
  const data = parsed.data;

  const recurring = await prisma.recurringAppointment.create({
    data: {
      athleteId: data.athleteId,
      coachId: data.coachId,
      sportId: data.sportId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      frequency: data.frequency,
      startDate: new Date(data.startDate),
      endType: data.endType,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      numberOfSessions: data.numberOfSessions,
      paymentArrangement: data.paymentArrangement,
      notes: data.notes,
    },
  });

  const { created, skipped } = await generateRecurringOccurrences(recurring);

  await logAudit({
    actorId: session!.user.id,
    action: "recurring.created",
    recordType: "RecurringAppointment",
    recordId: recurring.id,
    after: { ...data, occurrencesCreated: created, occurrencesSkipped: skipped },
  });

  revalidatePath("/admin/recurring-training");
  return { success: true };
}

export async function cancelRecurringAppointmentAction(recurringId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  await prisma.recurringAppointment.update({ where: { id: recurringId }, data: { status: "CANCELLED" } });
  await prisma.appointment.updateMany({
    where: { recurringAppointmentId: recurringId, status: { in: ["SCHEDULED", "CONFIRMED"] }, startsAt: { gte: new Date() } },
    data: { status: "COACH_CANCELLED", cancellationReason: "Recurring arrangement cancelled by admin." },
  });

  await logAudit({ actorId: session!.user.id, action: "recurring.cancelled", recordType: "RecurringAppointment", recordId: recurringId });
  revalidatePath("/admin/recurring-training");
}
