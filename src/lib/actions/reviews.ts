"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({
  appointmentId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  feedback: z.string().optional(),
});

export type ReviewState = { error?: string; success?: boolean };

export async function submitReviewAction(_prev: ReviewState, formData: FormData): Promise<ReviewState> {
  const session = await auth();
  if (!session) return { error: "Please log in." };

  const parsed = schema.safeParse({
    appointmentId: formData.get("appointmentId"),
    rating: formData.get("rating"),
    feedback: formData.get("feedback") || undefined,
  });
  if (!parsed.success) return { error: "Please provide a rating." };

  const appointment = await prisma.appointment.findUnique({ where: { id: parsed.data.appointmentId } });
  if (!appointment || appointment.householdId !== session.user.householdId) {
    return { error: "Appointment not found." };
  }
  if (appointment.status !== "COMPLETED") {
    return { error: "You can only review completed sessions." };
  }

  await prisma.review.upsert({
    where: { appointmentId: appointment.id },
    update: { rating: parsed.data.rating, feedback: parsed.data.feedback },
    create: {
      appointmentId: appointment.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      feedback: parsed.data.feedback,
    },
  });

  revalidatePath(`/dashboard/appointments/${appointment.id}`);
  return { success: true };
}
