"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/notifications";

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
});

export type ContactState = { success?: boolean; error?: string };

export async function submitContactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: "Please fill out all required fields correctly." };

  const { name, email, phone, message } = parsed.data;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "justin@allinonesportsacademy.com";

  await sendEmail({
    to: adminEmail,
    subject: `New contact form submission from ${name}`,
    body: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${
      phone ?? "—"
    }</p><p><strong>Message:</strong><br/>${message}</p>`,
    type: "GENERIC",
  });

  return { success: true };
}
