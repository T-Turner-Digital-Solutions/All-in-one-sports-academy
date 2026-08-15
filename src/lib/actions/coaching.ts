"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertOwnsCoachRecord } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

async function requireCoachForAppointment(appointmentId: string) {
  const session = await auth();
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) throw new Error("Appointment not found");
  assertOwnsCoachRecord(session, appointment.coachId);
  return { session: session!, appointment };
}

const attendanceSchema = z.object({
  appointmentId: z.string().min(1),
  status: z.nativeEnum(AttendanceStatus),
});

export async function updateAttendanceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const parsed = attendanceSchema.parse({
      appointmentId: formData.get("appointmentId"),
      status: formData.get("status"),
    });
    const { appointment } = await requireCoachForAppointment(parsed.appointmentId);

    await prisma.$transaction([
      prisma.attendance.upsert({
        where: { appointmentId: appointment.id },
        update: { status: parsed.status, checkedInAt: parsed.status === "CHECKED_IN" ? new Date() : undefined },
        create: { appointmentId: appointment.id, status: parsed.status },
      }),
      prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: parsed.status },
      }),
    ]);

    revalidatePath(`/coach/sessions/${appointment.id}`);
    revalidatePath("/coach/schedule");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Couldn't update attendance." };
  }
}

const sessionNoteSchema = z.object({
  appointmentId: z.string().min(1),
  skillsTrained: z.string().optional(),
  strengths: z.string().optional(),
  areasForImprovement: z.string().optional(),
  drillsCompleted: z.string().optional(),
  atHomeAssignments: z.string().optional(),
  coachComments: z.string().optional(),
  nextSessionRecommendation: z.string().optional(),
  internalNotes: z.string().optional(),
});

export async function saveSessionNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { appointmentId: _appointmentId, ...parsed } = sessionNoteSchema.parse(Object.fromEntries(formData.entries()));
    const { appointment } = await requireCoachForAppointment(_appointmentId);

    await prisma.sessionNote.upsert({
      where: { appointmentId: appointment.id },
      update: parsed,
      create: {
        appointmentId: appointment.id,
        athleteId: appointment.athleteId,
        coachId: appointment.coachId,
        ...parsed,
      },
    });

    revalidatePath(`/coach/sessions/${appointment.id}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Couldn't save session note." };
  }
}

const evaluationSchema = z.object({
  athleteId: z.string().min(1),
  isBaseline: z.coerce.boolean().optional(),
  coachRating: z.coerce.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
});

export async function addEvaluationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session || session.user.role !== "COACH" || !session.user.coachId) return { error: "Coach login required." };

  const parsed = evaluationSchema.safeParse({
    athleteId: formData.get("athleteId"),
    isBaseline: formData.get("isBaseline") || undefined,
    coachRating: formData.get("coachRating") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Please complete the evaluation." };

  const metrics: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("metric_") && typeof value === "string" && value.trim()) {
      metrics[key.replace("metric_", "")] = value;
    }
  }

  await prisma.evaluation.create({
    data: {
      athleteId: parsed.data.athleteId,
      coachId: session.user.coachId,
      metrics,
      coachRating: parsed.data.coachRating,
      notes: parsed.data.notes,
      isBaseline: Boolean(parsed.data.isBaseline),
    },
  });

  for (const [key, value] of Object.entries(metrics)) {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      await prisma.progressMetric.create({
        data: {
          athleteId: parsed.data.athleteId,
          metricKey: key,
          metricLabel: key.replaceAll("_", " "),
          value: numeric,
          visibleToClient: true,
        },
      });
    }
  }

  revalidatePath(`/coach/athletes/${parsed.data.athleteId}`);
  revalidatePath(`/dashboard/athletes/${parsed.data.athleteId}`);
  return { success: true };
}
