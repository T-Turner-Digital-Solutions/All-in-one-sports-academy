"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { Role, DiscountType } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const promoSchema = z.object({
  code: z.string().min(2),
  discountType: z.nativeEnum(DiscountType),
  percentOff: z.coerce.number().int().min(1).max(100).optional(),
  amountOffCents: z.coerce.number().int().min(1).optional(),
  maxUses: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

export async function createPromoCodeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = promoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Please complete the promo code fields." };
  const data = parsed.data;

  const existing = await prisma.promoCode.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) return { error: "That code already exists." };

  await prisma.promoCode.create({
    data: {
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      percentOff: data.percentOff,
      amountOffCents: data.amountOffCents,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      isActive: true,
    },
  });

  revalidatePath("/admin/promo-codes");
  return { success: true };
}

export async function togglePromoCodeAction(id: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) return;
  await prisma.promoCode.update({ where: { id }, data: { isActive: !promo.isActive } });
  revalidatePath("/admin/promo-codes");
}

const giftSchema = z.object({
  code: z.string().min(2),
  initialValueCents: z.coerce.number().int().min(1),
  recipientEmail: z.string().email().optional(),
});

export async function createGiftCertificateAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = giftSchema.safeParse({
    code: formData.get("code"),
    initialValueCents: formData.get("initialValueCents"),
    recipientEmail: formData.get("recipientEmail") || undefined,
  });
  if (!parsed.success) return { error: "Please complete the gift certificate fields." };
  const data = parsed.data;

  const existing = await prisma.giftCertificate.findUnique({ where: { code: data.code.toUpperCase() } });
  if (existing) return { error: "That code already exists." };

  await prisma.giftCertificate.create({
    data: {
      code: data.code.toUpperCase(),
      initialValueCents: data.initialValueCents,
      remainingValueCents: data.initialValueCents,
      recipientEmail: data.recipientEmail,
      isActive: true,
    },
  });

  revalidatePath("/admin/gift-certificates");
  return { success: true };
}
