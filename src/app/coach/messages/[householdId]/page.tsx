import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/portal/MessageThread";

export const dynamic = "force-dynamic";

export default async function CoachMessageThreadPage({ params }: { params: Promise<{ householdId: string }> }) {
  const { householdId } = await params;
  const session = await auth();
  const coachId = session!.user.coachId!;

  const worked = await prisma.appointment.findFirst({ where: { coachId, householdId } });
  if (!worked) notFound();

  const threadKey = `coach:${coachId}:${householdId}`;
  const messages = await prisma.message.findMany({
    where: { threadKey },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Conversation</h1>
      <div className="mt-6">
        <MessageThread
          threadKey={threadKey}
          messages={messages.map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt.toISOString(),
            senderName: `${m.sender.firstName} ${m.sender.lastName}`,
            isMine: m.senderId === session!.user.id,
          }))}
        />
      </div>
    </div>
  );
}
