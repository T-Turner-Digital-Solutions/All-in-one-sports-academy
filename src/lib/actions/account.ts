"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

export type AccountState = { error?: string; success?: boolean };

export async function updateProfileAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session) return { error: "Please log in." };
  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { error: "Please fill out your name." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/coach/settings");
  return { success: true };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changePasswordAction(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const session = await auth();
  if (!session) return { error: "Please log in." };
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: "New password must be at least 8 characters." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { success: true };
}
