"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({
  single_session_price_cents: z.coerce.number().int().min(0),
});

export async function updateSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN);

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please provide valid numeric settings." };

  for (const [key, value] of Object.entries(parsed.data)) {
    const before = await prisma.setting.findUnique({ where: { key } });
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
    await logAudit({
      actorId: session!.user.id,
      action: "setting.changed",
      recordType: "Setting",
      recordId: key,
      before: before?.value ?? undefined,
      after: value,
    });
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
