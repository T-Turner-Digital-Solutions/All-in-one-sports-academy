"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const sportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function createSportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const parsed = sportSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "Sport name is required." };

  const slug = slugify(parsed.data.name);
  const existing = await prisma.sport.findUnique({ where: { slug } });
  if (existing) return { error: "A sport with a similar name already exists." };

  const sport = await prisma.sport.create({
    data: { name: parsed.data.name, slug, description: parsed.data.description, isPublished: true },
  });

  await logAudit({ actorId: session!.user.id, action: "sport.created", recordType: "Sport", recordId: sport.id, after: sport });
  revalidatePath("/admin/sports");
  revalidatePath("/sports");
  return { success: true };
}

export async function toggleSportPublishedAction(sportId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport) return;
  const updated = await prisma.sport.update({ where: { id: sportId }, data: { isPublished: !sport.isPublished } });

  await logAudit({
    actorId: session!.user.id,
    action: "sport.publish_toggled",
    recordType: "Sport",
    recordId: sportId,
    before: { isPublished: sport.isPublished },
    after: { isPublished: updated.isPublished },
  });
  revalidatePath("/admin/sports");
  revalidatePath("/sports");
}

export async function deleteSportAction(sportId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);

  const inUse = await prisma.appointment.findFirst({ where: { sportId } });
  if (inUse) {
    // Never hard-delete a sport with booking history — hide it instead.
    await prisma.sport.update({ where: { id: sportId }, data: { isPublished: false } });
  } else {
    await prisma.sport.delete({ where: { id: sportId } });
  }

  await logAudit({ actorId: session!.user.id, action: "sport.deleted", recordType: "Sport", recordId: sportId });
  revalidatePath("/admin/sports");
  revalidatePath("/sports");
}
