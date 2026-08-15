"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertOwnsCoachRecord } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: boolean };

const availabilitySchema = z.object({
  coachId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

export async function addRecurringAvailabilityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const parsed = availabilitySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please fill out day and time range." };
  assertOwnsCoachRecord(session, parsed.data.coachId);

  if (parsed.data.startTime >= parsed.data.endTime) {
    return { error: "End time must be after start time." };
  }

  await prisma.coachAvailability.create({
    data: {
      coachId: parsed.data.coachId,
      type: "RECURRING",
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    },
  });

  revalidatePath("/coach/availability");
  return { success: true };
}

export async function removeAvailabilityAction(coachId: string, availabilityId: string) {
  const session = await auth();
  assertOwnsCoachRecord(session, coachId);
  await prisma.coachAvailability.delete({ where: { id: availabilityId } });
  revalidatePath("/coach/availability");
}

const blockedTimeSchema = z.object({
  coachId: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  reason: z.enum(["VACATION", "TIME_OFF_REQUEST", "PERSONAL_APPOINTMENT", "OTHER"]),
  notes: z.string().optional(),
});

export async function addBlockedTimeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const parsed = blockedTimeSchema.safeParse({
    coachId: formData.get("coachId"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Please provide a valid date range." };
  assertOwnsCoachRecord(session, parsed.data.coachId);

  await prisma.blockedTime.create({
    data: {
      coachId: parsed.data.coachId,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      reason: parsed.data.reason,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/coach/availability");
  return { success: true };
}
