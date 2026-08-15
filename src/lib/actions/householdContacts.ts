"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertOwnsHousehold } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export type ActionState = { error?: string; success?: boolean };

const contactSchema = z.object({
  householdId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(7).optional().or(z.literal("")),
});

export async function addHouseholdContactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  const parsed = contactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please enter a name and at least one way to reach them." };
  assertOwnsHousehold(session, parsed.data.householdId);

  const email = parsed.data.email || undefined;
  const phone = parsed.data.phone || undefined;
  if (!email && !phone) {
    return { error: "Add an email or phone number so they can actually receive reminders." };
  }

  await prisma.householdContact.create({
    data: {
      householdId: parsed.data.householdId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email,
      phone,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function removeHouseholdContactAction(householdId: string, contactId: string) {
  const session = await auth();
  assertOwnsHousehold(session, householdId);
  await prisma.householdContact.deleteMany({ where: { id: contactId, householdId } });
  revalidatePath("/dashboard/settings");
}
