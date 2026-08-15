"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({ key: z.string().min(1), value: z.string().min(1) });

export async function saveWebsiteContentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = schema.safeParse({ key: formData.get("key"), value: formData.get("value") });
  if (!parsed.success) return { error: "Missing content." };

  await prisma.websiteContent.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value },
    create: { key: parsed.data.key, value: parsed.data.value },
  });

  revalidatePath("/admin/website-content");
  revalidatePath("/");
  return { success: true };
}
