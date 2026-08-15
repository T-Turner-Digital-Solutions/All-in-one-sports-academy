"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Role, PackageType } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const programSchema = z.object({ name: z.string().min(1), description: z.string().optional(), sportId: z.string().optional() });

export async function createProgramAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = programSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    sportId: formData.get("sportId") || undefined,
  });
  if (!parsed.success) return { error: "Program name is required." };

  await prisma.trainingProgram.create({ data: { ...parsed.data, isPublished: true } });
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  return { success: true };
}

export async function toggleProgramPublishedAction(programId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const program = await prisma.trainingProgram.findUnique({ where: { id: programId } });
  if (!program) return;
  await prisma.trainingProgram.update({ where: { id: programId }, data: { isPublished: !program.isPublished } });
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

const packageSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(PackageType),
  description: z.string().optional(),
  sessionCount: z.coerce.number().int().min(1).optional(),
  priceCents: z.coerce.number().int().min(0),
});

export async function createPackageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = packageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete all package fields." };

  const pkg = await prisma.package.create({ data: { ...parsed.data, isPublished: true, isActive: true } });
  await logAudit({ actorId: session!.user.id, action: "package.created", recordType: "Package", recordId: pkg.id, after: pkg });

  revalidatePath("/admin/packages");
  revalidatePath("/packages");
  return { success: true };
}

export async function togglePackageActiveAction(packageId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  if (!pkg) return;
  const before = { isActive: pkg.isActive };
  await prisma.package.update({ where: { id: packageId }, data: { isActive: !pkg.isActive } });
  await logAudit({ actorId: session!.user.id, action: "package.toggled", recordType: "Package", recordId: packageId, before, after: { isActive: !pkg.isActive } });
  revalidatePath("/admin/packages");
  revalidatePath("/packages");
}
