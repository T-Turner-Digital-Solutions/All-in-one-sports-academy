"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({ bio: z.string().optional() });

export type ActionState = { error?: string; success?: boolean };

export async function updateCoachBioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session || session.user.role !== "COACH" || !session.user.coachId) return { error: "Coach login required." };
  const parsed = schema.safeParse({ bio: formData.get("bio") || undefined });
  if (!parsed.success) return { error: "Invalid input." };

  await prisma.coach.update({ where: { id: session.user.coachId }, data: { bio: parsed.data.bio } });
  revalidatePath("/coach/settings");
  return { success: true };
}
