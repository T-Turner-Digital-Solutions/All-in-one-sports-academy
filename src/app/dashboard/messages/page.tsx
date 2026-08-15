import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/portal/MessageThread";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  const threadKey = `household:${session!.user.householdId}`;

  const messages = await prisma.message.findMany({
    where: { threadKey },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Messages</h1>
      <p className="mt-1 text-aio-silver">Direct line to the Academy team.</p>
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
