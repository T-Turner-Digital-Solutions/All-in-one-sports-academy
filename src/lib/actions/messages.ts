"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const schema = z.object({
  threadKey: z.string().min(1),
  body: z.string().min(1),
});

export type SendMessageState = { error?: string; success?: boolean };

export async function sendMessageAction(_prev: SendMessageState, formData: FormData): Promise<SendMessageState> {
  const session = await auth();
  if (!session) return { error: "Please log in." };

  const parsed = schema.safeParse({ threadKey: formData.get("threadKey"), body: formData.get("body") });
  if (!parsed.success) return { error: "Message can't be empty." };

  await prisma.message.create({
    data: { senderId: session.user.id, threadKey: parsed.data.threadKey, body: parsed.data.body },
  });

  revalidatePath("/dashboard/messages");
  revalidatePath("/coach/messages");
  revalidatePath("/admin/messages");
  return { success: true };
}
