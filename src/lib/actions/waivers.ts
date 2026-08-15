"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { WaiverType } from "@prisma/client";

const WAIVER_AGREEMENT_VERSION = "2026-01-v1";

const schema = z.object({
  athleteId: z.string().min(1),
  type: z.nativeEnum(WaiverType),
  signedName: z.string().min(1),
});

export type SignWaiverState = { error?: string; success?: boolean };

export async function signWaiverAction(_prev: SignWaiverState, formData: FormData): Promise<SignWaiverState> {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT" || !session.user.householdId) {
    return { error: "Please log in to sign a waiver." };
  }

  const parsed = schema.safeParse({
    athleteId: formData.get("athleteId"),
    type: formData.get("type"),
    signedName: formData.get("signedName"),
  });
  if (!parsed.success) return { error: "Please provide your full legal name to sign." };
  const { athleteId, type, signedName } = parsed.data;

  const athlete = await prisma.athlete.findUnique({ where: { id: athleteId } });
  if (!athlete || athlete.householdId !== session.user.householdId) {
    return { error: "Athlete not found." };
  }

  const headersList = await headers();

  await prisma.waiverSignature.create({
    data: {
      athleteId,
      householdId: session.user.householdId,
      type,
      signedName,
      signatureData: signedName, // typed-name signature; upgrade to drawn signature capture if required
      agreementVersion: WAIVER_AGREEMENT_VERSION,
      ipAddress: headersList.get("x-forwarded-for") ?? undefined,
      userAgent: headersList.get("user-agent") ?? undefined,
    },
  });

  revalidatePath(`/dashboard/athletes/${athleteId}`);
  revalidatePath("/dashboard/waivers");
  return { success: true };
}
