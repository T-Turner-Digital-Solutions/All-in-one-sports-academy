import { prisma } from "@/lib/prisma";
import { NotificationChannel, NotificationType } from "@prisma/client";

/**
 * Notification architecture: every notification is recorded in the database
 * regardless of whether a live provider is configured, so the admin portal
 * always has a complete communication log. Email sends via Resend when
 * RESEND_API_KEY is set; SMS is architected for Twilio but stays a logged
 * no-op (status SKIPPED_NOT_CONFIGURED) until TWILIO_* env vars are set.
 */

type SendEmailArgs = {
  userId?: string;
  to: string;
  subject: string;
  body: string;
  type: NotificationType;
  relatedAppointmentId?: string;
};

type SendSmsArgs = {
  userId?: string;
  to: string;
  body: string;
  type: NotificationType;
  relatedAppointmentId?: string;
};

export async function sendEmail({ userId, to, subject, body, type, relatedAppointmentId }: SendEmailArgs) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      channel: NotificationChannel.EMAIL,
      type,
      subject,
      body,
      status: "PENDING",
      relatedAppointmentId,
    },
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SKIPPED_NOT_CONFIGURED" },
    });
    return notification;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "All In One Sports Academy <no-reply@allinonesportsacademy.com>",
      to,
      subject,
      html: body,
    });
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED", errorMessage: err instanceof Error ? err.message : String(err) },
    });
  }

  return notification;
}

export async function sendSms({ userId, to, body, type, relatedAppointmentId }: SendSmsArgs) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      channel: NotificationChannel.SMS,
      type,
      body,
      status: "PENDING",
      relatedAppointmentId,
    },
  });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SKIPPED_NOT_CONFIGURED" },
    });
    return notification;
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (!res.ok) throw new Error(`Twilio error ${res.status}`);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED", errorMessage: err instanceof Error ? err.message : String(err) },
    });
  }

  return notification;
}
