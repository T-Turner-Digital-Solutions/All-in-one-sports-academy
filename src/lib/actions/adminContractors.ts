"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertCanManageContractors } from "@/lib/rbac";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { ContractorStatus } from "@prisma/client";

export type ActionState = { error?: string; success?: boolean };

const decisionSchema = z.object({
  applicationId: z.string().min(1),
  status: z.nativeEnum(ContractorStatus),
  reviewerNotes: z.string().optional(),
});

export async function updateContractorApplicationStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  assertCanManageContractors(session);

  const parsed = decisionSchema.safeParse({
    applicationId: formData.get("applicationId"),
    status: formData.get("status"),
    reviewerNotes: formData.get("reviewerNotes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid decision." };

  const application = await prisma.contractorApplication.findUnique({ where: { id: parsed.data.applicationId }, include: { user: true } });
  if (!application) return { error: "Application not found." };

  await prisma.contractorApplication.update({
    where: { id: application.id },
    data: {
      status: parsed.data.status,
      reviewerNotes: parsed.data.reviewerNotes,
      reviewedById: session!.user.id,
      reviewedAt: new Date(),
    },
  });

  // Approval provisions a Coach record and elevates the user's role — this is
  // the only path by which a user gains coach portal / client-data access.
  if (parsed.data.status === "APPROVED" || parsed.data.status === "ACTIVE") {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: application.userId }, data: { role: "COACH" } });
      const existingCoach = await tx.coach.findUnique({ where: { userId: application.userId } });
      if (!existingCoach) {
        await tx.coach.create({
          data: {
            userId: application.userId,
            bio: application.biography,
            status: "ACTIVE",
            applicationId: application.id,
            compensationType: "FLAT_PER_SESSION",
            flatAmountCents: 4000,
          },
        });
      }
    });

    await sendEmail({
      userId: application.userId,
      to: application.email,
      subject: "You're approved to coach with All In One Sports Academy!",
      body: `<p>Hi ${application.fullName},</p><p>Great news — your coaching application has been
        approved. Log in to your coach account any time to access your Coach Portal.</p>`,
      type: "CONTRACTOR_STATUS_CHANGE",
    });
  }

  if (parsed.data.status === "SUSPENDED" || parsed.data.status === "INACTIVE" || parsed.data.status === "DENIED") {
    const coach = await prisma.coach.findUnique({ where: { userId: application.userId } });
    if (coach) {
      await prisma.coach.update({
        where: { id: coach.id },
        data: { status: parsed.data.status === "INACTIVE" || parsed.data.status === "DENIED" ? "INACTIVE" : "SUSPENDED" },
      });
    }
    await sendEmail({
      userId: application.userId,
      to: application.email,
      subject: "Update on your All In One Sports Academy coaching status",
      body: `<p>Hi ${application.fullName},</p><p>Your coaching status has been updated to
        ${parsed.data.status.replaceAll("_", " ")}.${parsed.data.reviewerNotes ? ` Notes: ${parsed.data.reviewerNotes}` : ""}</p>`,
      type: "CONTRACTOR_STATUS_CHANGE",
    });
  }

  if (parsed.data.status === "MORE_INFO_REQUIRED") {
    await sendEmail({
      userId: application.userId,
      to: application.email,
      subject: "Additional information needed for your coaching application",
      body: `<p>Hi ${application.fullName},</p><p>We need a bit more information to continue reviewing
        your application: ${parsed.data.reviewerNotes ?? "Please contact the Academy for details."}</p>`,
      type: "CONTRACTOR_STATUS_CHANGE",
    });
  }

  await logAudit({
    actorId: session!.user.id,
    action: "contractor.status_changed",
    recordType: "ContractorApplication",
    recordId: application.id,
    before: { status: application.status },
    after: { status: parsed.data.status },
  });

  revalidatePath("/admin/contractor-applications");
  revalidatePath(`/admin/contractor-applications/${application.id}`);
  return { success: true };
}
