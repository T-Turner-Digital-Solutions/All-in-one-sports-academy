"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sportId: z.string().optional(),
  locationId: z.string().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  priceCents: z.coerce.number().int().min(0),
  maxParticipants: z.coerce.number().int().min(1),
  registrationDeadline: z.string().optional(),
  minAge: z.coerce.number().int().optional(),
  maxAge: z.coerce.number().int().optional(),
});

export async function createCampAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete all required fields." };
  const data = parsed.data;

  await prisma.camp.create({
    data: {
      name: data.name,
      description: data.description,
      sportId: data.sportId || undefined,
      locationId: data.locationId || undefined,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      priceCents: data.priceCents,
      maxParticipants: data.maxParticipants,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
      minAge: data.minAge,
      maxAge: data.maxAge,
      isPublished: true,
    },
  });

  revalidatePath("/admin/camps");
  revalidatePath("/camps");
  return { success: true };
}

export async function toggleCampPublishedAction(campId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const camp = await prisma.camp.findUnique({ where: { id: campId } });
  if (!camp) return;
  await prisma.camp.update({ where: { id: campId }, data: { isPublished: !camp.isPublished } });
  revalidatePath("/admin/camps");
  revalidatePath("/camps");
}
