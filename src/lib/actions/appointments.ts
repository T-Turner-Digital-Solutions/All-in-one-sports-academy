"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rescheduleAppointment, ForbiddenActionError, SlotConflictError } from "@/lib/appointments";
import { revalidatePath } from "next/cache";

export type RescheduleState = { error?: string; success?: boolean; newAppointmentId?: string };

export async function rescheduleAppointmentAction(
  _prev: RescheduleState,
  formData: FormData
): Promise<RescheduleState> {
  const session = await auth();
  if (!session) return { error: "Please log in." };

  const appointmentId = formData.get("appointmentId");
  const newStartsAt = formData.get("newStartsAt");
  if (typeof appointmentId !== "string" || typeof newStartsAt !== "string" || !newStartsAt) {
    return { error: "Please choose a new time." };
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { error: "Appointment not found." };

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN";
  if (!isAdmin && appointment.householdId !== session.user.householdId) {
    return { error: "You don't have access to this appointment." };
  }

  try {
    const result = await rescheduleAppointment({
      appointmentId,
      newStartsAt: new Date(newStartsAt),
      actingUserId: session.user.id,
      isAdminOverride: isAdmin,
    });
    revalidatePath("/dashboard/appointments");
    revalidatePath(`/dashboard/appointments/${appointmentId}`);
    return { success: true, newAppointmentId: result.id };
  } catch (err) {
    if (err instanceof ForbiddenActionError || err instanceof SlotConflictError) {
      return { error: err.message };
    }
    console.error(err);
    return { error: "Something went wrong rescheduling this session." };
  }
}
