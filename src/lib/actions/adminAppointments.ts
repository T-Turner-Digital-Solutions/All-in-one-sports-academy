"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/notifications";
import { formatDateTime } from "@/lib/format";
import { cancelAppointment, rescheduleAppointment } from "@/lib/appointments";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const reassignSchema = z.object({
  appointmentId: z.string().min(1),
  newCoachId: z.string().min(1),
});

export async function reassignCoachAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const parsed = reassignSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    newCoachId: formData.get("newCoachId"),
  });
  if (!parsed.success) return { error: "Please choose a coach." };

  const appointment = await prisma.appointment.findUnique({
    where: { id: parsed.data.appointmentId },
    include: { household: { include: { members: true } }, sport: true },
  });
  if (!appointment) return { error: "Appointment not found." };

  const qualified = await prisma.coachSport.findUnique({
    where: { coachId_sportId: { coachId: parsed.data.newCoachId, sportId: appointment.sportId } },
  });
  if (!qualified) return { error: "That coach isn't qualified for this sport." };

  const conflict = await prisma.appointment.findUnique({
    where: { coachId_startsAt: { coachId: parsed.data.newCoachId, startsAt: appointment.startsAt } },
  });
  if (conflict) return { error: "That coach already has a session at this time." };

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { coachId: parsed.data.newCoachId, substitutedForCoachId: appointment.coachId },
  });

  await logAudit({
    actorId: session!.user.id,
    action: "appointment.coach_reassigned",
    recordType: "Appointment",
    recordId: appointment.id,
    before: { coachId: appointment.coachId },
    after: { coachId: parsed.data.newCoachId },
  });

  for (const member of appointment.household.members) {
    await sendEmail({
      userId: member.id,
      to: member.email,
      subject: "Your coach has been updated",
      body: `<p>Hi ${member.firstName},</p><p>Your ${appointment.sport.name} session on
        ${formatDateTime(appointment.startsAt)} has a new assigned coach due to a scheduling change.
        Log in to your dashboard for details, or reschedule if the new coach doesn't work for you.</p>`,
      type: "COACH_SUBSTITUTION",
    });
  }

  revalidatePath(`/admin/appointments/${appointment.id}`);
  return { success: true };
}

const cancelSchema = z.object({
  appointmentId: z.string().min(1),
  reason: z.string().min(1),
});

export async function adminCancelAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = cancelSchema.safeParse({ appointmentId: formData.get("appointmentId"), reason: formData.get("reason") });
  if (!parsed.success) return { error: "Please provide a cancellation reason." };

  try {
    await cancelAppointment({
      appointmentId: parsed.data.appointmentId,
      status: "COACH_CANCELLED",
      reason: parsed.data.reason,
      cancelledByUserId: session!.user.id,
      transferCredit: true,
    });
    revalidatePath(`/admin/appointments/${parsed.data.appointmentId}`);
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Couldn't cancel this appointment." };
  }
}

const adminRescheduleSchema = z.object({
  appointmentId: z.string().min(1),
  newStartsAt: z.string().min(1),
});

export async function adminRescheduleAppointmentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = adminRescheduleSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    newStartsAt: formData.get("newStartsAt"),
  });
  if (!parsed.success) return { error: "Please choose a new time." };

  try {
    await rescheduleAppointment({
      appointmentId: parsed.data.appointmentId,
      newStartsAt: new Date(parsed.data.newStartsAt),
      actingUserId: session!.user.id,
      isAdminOverride: true,
    });
    revalidatePath("/admin/appointments");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: err instanceof Error ? err.message : "Couldn't reschedule this appointment." };
  }
}
