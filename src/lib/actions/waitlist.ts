"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const joinSchema = z.object({
  athleteId: z.string().min(1),
  sportId: z.string().min(1),
  coachId: z.string().optional(),
  desiredDate: z.string().optional(),
  desiredTimeStart: z.string().optional(),
  desiredTimeEnd: z.string().optional(),
  flexible: z.coerce.boolean().optional(),
});

export type JoinWaitlistState = { error?: string; success?: boolean };

export async function joinWaitlistAction(_prev: JoinWaitlistState, formData: FormData): Promise<JoinWaitlistState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") {
    return { error: "Please log in to your client account to join a waitlist." };
  }

  const parsed = joinSchema.safeParse({
    athleteId: formData.get("athleteId"),
    sportId: formData.get("sportId"),
    coachId: formData.get("coachId") || undefined,
    desiredDate: formData.get("desiredDate") || undefined,
    desiredTimeStart: formData.get("desiredTimeStart") || undefined,
    desiredTimeEnd: formData.get("desiredTimeEnd") || undefined,
    flexible: formData.get("flexible") || undefined,
  });
  if (!parsed.success) return { error: "Please complete the waitlist form." };
  const data = parsed.data;

  const athlete = await prisma.athlete.findUnique({ where: { id: data.athleteId } });
  if (!athlete || athlete.householdId !== session.user.householdId) {
    return { error: "That athlete doesn't belong to your account." };
  }

  await prisma.$transaction(async (tx) => {
    let waitlist = await tx.waitlist.findFirst({
      where: {
        sportId: data.sportId,
        coachId: data.coachId ?? null,
        status: "OPEN",
        desiredDate: data.desiredDate ? new Date(data.desiredDate) : null,
      },
    });

    if (!waitlist) {
      waitlist = await tx.waitlist.create({
        data: {
          sportId: data.sportId,
          coachId: data.coachId,
          desiredDate: data.desiredDate ? new Date(data.desiredDate) : undefined,
          desiredTimeStart: data.desiredTimeStart,
          desiredTimeEnd: data.desiredTimeEnd,
          flexible: Boolean(data.flexible),
        },
      });
    }

    const count = await tx.waitlistEntry.count({ where: { waitlistId: waitlist.id } });
    await tx.waitlistEntry.create({
      data: {
        waitlistId: waitlist.id,
        athleteId: data.athleteId,
        coachId: data.coachId,
        position: count + 1,
      },
    });
  });

  return { success: true };
}
