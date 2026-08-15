"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/notifications";
import { DocumentType } from "@prisma/client";

const applicationSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  address: z.string().min(1),
  sportsCoached: z.string().min(1),
  trainingSpecialties: z.string().optional(),
  positionsTrained: z.string().optional(),
  yearsExperience: z.coerce.number().int().min(0).optional(),
  biography: z.string().optional(),
  coachingHistory: z.string().optional(),
  certifications: z.string().optional(),
  cprFirstAid: z.coerce.boolean().optional(),
  references: z.string().optional(),
  availability: z.string().optional(),
  preferredLocation: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  backgroundCheckAuthorized: z.coerce.boolean(),
});

export type ContractorApplicationState = { success?: boolean; error?: string };

const DOCUMENT_FIELDS: Array<{ field: string; type: DocumentType }> = [
  { field: "doc_profile_photo", type: DocumentType.PROFILE_PHOTO },
  { field: "doc_resume", type: DocumentType.RESUME },
  { field: "doc_drivers_license", type: DocumentType.DRIVERS_LICENSE_ID },
  { field: "doc_w9", type: DocumentType.W9 },
  { field: "doc_certificate", type: DocumentType.COACHING_CERTIFICATE },
  { field: "doc_cpr", type: DocumentType.CPR_FIRST_AID },
  { field: "doc_background_check", type: DocumentType.BACKGROUND_CHECK },
  { field: "doc_insurance", type: DocumentType.INSURANCE },
  { field: "doc_ica", type: DocumentType.INDEPENDENT_CONTRACTOR_AGREEMENT },
];

export async function submitContractorApplicationAction(
  _prev: ContractorApplicationState,
  formData: FormData
): Promise<ContractorApplicationState> {
  const session = await auth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const data = parsed.data;

  if (!data.backgroundCheckAuthorized) {
    return { error: "You must authorize a background check to apply." };
  }

  let userId = session?.user.id;

  if (!userId) {
    if (!data.password || data.password.length < 8) {
      return { error: "Password must be at least 8 characters." };
    }
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      return { error: "An account with this email already exists. Please log in first, then apply." };
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    const [firstName, ...rest] = data.fullName.trim().split(" ");
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName || data.fullName,
        lastName: rest.join(" ") || "",
        phone: data.phone,
        role: "CLIENT",
      },
    });
    userId = user.id;
  }

  const existingApplication = await prisma.contractorApplication.findUnique({ where: { userId } });
  if (existingApplication) {
    return { error: "You already have an application on file. Check your status on this page after logging in." };
  }

  const application = await prisma.contractorApplication.create({
    data: {
      userId,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      sportsCoached: data.sportsCoached.split(",").map((s) => s.trim()).filter(Boolean),
      trainingSpecialties: data.trainingSpecialties,
      positionsTrained: data.positionsTrained,
      yearsExperience: data.yearsExperience,
      biography: data.biography,
      coachingHistory: data.coachingHistory,
      certifications: data.certifications,
      cprFirstAid: Boolean(data.cprFirstAid),
      references: data.references,
      availability: data.availability,
      preferredLocation: data.preferredLocation,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      backgroundCheckAuthorized: data.backgroundCheckAuthorized,
      status: "PENDING_REVIEW",
    },
  });

  for (const { field, type } of DOCUMENT_FIELDS) {
    const url = formData.get(field);
    const fileName = formData.get(`${field}_fileName`);
    if (typeof url === "string" && url) {
      await prisma.contractorDocument.create({
        data: {
          applicationId: application.id,
          type,
          fileUrl: url,
          fileName: typeof fileName === "string" && fileName ? fileName : url,
        },
      });
    }
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "justin@allinonesportsacademy.com";
  await sendEmail({
    to: adminEmail,
    subject: "NEW CONTRACTOR APPLICATION",
    body: `<p>${data.fullName} (${data.email}) submitted a new coach application. Review it in the admin portal under Contractor Applications.</p>`,
    type: "ADMIN_ALERT",
  });

  return { success: true };
}
