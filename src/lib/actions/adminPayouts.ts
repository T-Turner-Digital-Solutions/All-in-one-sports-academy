"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const schema = z.object({ coachId: z.string().min(1) });

export async function issuePayoutAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const parsed = schema.safeParse({ coachId: formData.get("coachId") });
  if (!parsed.success) return { error: "Missing coach." };

  const owedEarnings = await prisma.coachEarning.findMany({
    where: { coachId: parsed.data.coachId, status: "owed" },
  });
  if (owedEarnings.length === 0) return { error: "No outstanding earnings for this coach." };

  const amountCents = owedEarnings.reduce((sum, e) => sum + e.coachAmountCents, 0);
  const periodStart = owedEarnings.reduce((min, e) => (e.createdAt < min ? e.createdAt : min), owedEarnings[0].createdAt);
  const periodEnd = new Date();

  const payout = await prisma.payout.create({
    data: { coachId: parsed.data.coachId, amountCents, periodStart, periodEnd, paidAt: new Date(), method: "manual" },
  });

  await prisma.coachEarning.updateMany({
    where: { id: { in: owedEarnings.map((e) => e.id) } },
    data: { status: "paid", payoutId: payout.id },
  });

  await logAudit({
    actorId: session!.user.id,
    action: "payout.issued",
    recordType: "Payout",
    recordId: payout.id,
    after: { coachId: parsed.data.coachId, amountCents },
  });

  revalidatePath("/admin/coach-payouts");
  return { success: true };
}
