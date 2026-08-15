"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const athleteSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().min(1),
  school: z.string().optional(),
  team: z.string().optional(),
  primarySportId: z.string().optional(),
  position: z.string().optional(),
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ELITE"]).optional(),
  developmentGoals: z.string().optional(),
  injuriesRestrictions: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  photoVideoRelease: z.coerce.boolean().optional(),
});

export type AthleteFormState = { error?: string; success?: boolean };

export async function createAthleteAction(_prev: AthleteFormState, formData: FormData): Promise<AthleteFormState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT" || !session.user.householdId) {
    return { error: "Please log in to your client account." };
  }

  const parsed = athleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete all required athlete fields." };
  const data = parsed.data;

  await prisma.athlete.create({
    data: {
      householdId: session.user.householdId,
      firstName: data.firstName,
      lastName: data.lastName,
      dob: new Date(data.dob),
      school: data.school,
      team: data.team,
      primarySportId: data.primarySportId || undefined,
      position: data.position,
      experienceLevel: data.experienceLevel,
      developmentGoals: data.developmentGoals,
      injuriesRestrictions: data.injuriesRestrictions,
      medicalNotes: data.medicalNotes,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      photoVideoRelease: Boolean(data.photoVideoRelease),
    },
  });

  revalidatePath("/dashboard/athletes");
  revalidatePath("/book");
  return { success: true };
}

export async function updateAthleteAction(
  athleteId: string,
  _prev: AthleteFormState,
  formData: FormData
): Promise<AthleteFormState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT" || !session.user.householdId) {
    return { error: "Please log in to your client account." };
  }

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete || athlete.householdId !== session.user.householdId) {
    return { error: "Athlete not found." };
  }

  const parsed = athleteSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete all required athlete fields." };
  const data = parsed.data;

  await prisma.athlete.update({
    where: { id: athleteId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: new Date(data.dob),
      school: data.school,
      team: data.team,
      primarySportId: data.primarySportId || undefined,
      position: data.position,
      experienceLevel: data.experienceLevel,
      developmentGoals: data.developmentGoals,
      injuriesRestrictions: data.injuriesRestrictions,
      medicalNotes: data.medicalNotes,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      photoVideoRelease: Boolean(data.photoVideoRelease),
    },
  });

  revalidatePath("/dashboard/athletes");
  return { success: true };
}
