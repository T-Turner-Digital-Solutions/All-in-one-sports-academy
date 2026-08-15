import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { MessageThread } from "@/components/portal/MessageThread";

export const dynamic = "force-dynamic";

export default async function AdminMessageThreadPage({ params }: { params: Promise<{ threadKey: string }> }) {
  const { threadKey: encoded } = await params;
  const threadKey = decodeURIComponent(encoded);
  const session = await auth();

  const messages = await prisma.message.findMany({
    where: { threadKey },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Conversation</h1>
      <p className="mt-1 text-xs text-aio-silver">{threadKey}</p>
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
