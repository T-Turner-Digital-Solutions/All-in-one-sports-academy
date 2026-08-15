import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const threads = await prisma.message.groupBy({
    by: ["threadKey"],
    _max: { createdAt: true },
    _count: { _all: true },
    orderBy: { _max: { createdAt: "desc" } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Messages</h1>
      <div className="mt-6 space-y-2">
        {threads.map((t) => (
          <Link key={t.threadKey} href={`/admin/messages/${encodeURIComponent(t.threadKey)}`} className="aio-card flex justify-between p-4 text-sm hover:border-aio-red">
            <span>{t.threadKey}</span>
            <span className="text-xs text-aio-silver">
              {t._count._all} messages · last {t._max.createdAt ? formatDateTime(t._max.createdAt) : "—"}
            </span>
          </Link>
        ))}
        {threads.length === 0 ? <p className="text-sm text-aio-silver">No conversations yet.</p> : null}
      </div>
    </div>
  );
}
