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
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  hours: z.string().optional(),
  instructions: z.string().optional(),
});

export async function createLocationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete all required fields." };

  const location = await prisma.location.create({ data: parsed.data });
  await logAudit({ actorId: session!.user.id, action: "location.created", recordType: "Location", recordId: location.id, after: location });

  revalidatePath("/admin/locations");
  return { success: true };
}

export async function toggleLocationActiveAction(locationId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const location = await prisma.location.findUnique({ where: { id: locationId } });
  if (!location) return;
  await prisma.location.update({ where: { id: locationId }, data: { isActive: !location.isActive } });
  revalidatePath("/admin/locations");
}
