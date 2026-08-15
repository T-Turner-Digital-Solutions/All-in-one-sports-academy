"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function toggleReviewApprovalAction(reviewId: string) {
  const session = await auth();
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;
  await prisma.review.update({ where: { id: reviewId }, data: { isApprovedPublic: !review.isApprovedPublic } });
  revalidatePath("/admin/reviews");
  revalidatePath("/athlete-success");
}
