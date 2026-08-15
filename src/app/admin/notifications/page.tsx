import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  const skippedCount = notifications.filter((n) => n.status === "SKIPPED_NOT_CONFIGURED").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Notifications</h1>
      {skippedCount > 0 ? (
        <p className="mt-2 border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-500">
          {skippedCount} notification(s) were skipped because an email/SMS provider isn&apos;t configured
          yet. Set RESEND_API_KEY and/or TWILIO_* environment variables to enable live delivery.
        </p>
      ) : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">To</th>
              <th className="py-2 pr-4">Channel</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b border-white/5">
                <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(n.createdAt)}</td>
                <td className="py-2 pr-4">
                  {n.user ? `${n.user.firstName} ${n.user.lastName}` : "Contact"}
                  {n.to ? <span className="text-aio-silver"> · {n.to}</span> : null}
                </td>
                <td className="py-2 pr-4">{n.channel}</td>
                <td className="py-2 pr-4">{n.type.replaceAll("_", " ")}</td>
                <td className={`py-2 pr-4 ${n.status === "FAILED" ? "text-aio-red" : n.status === "SENT" ? "text-green-500" : "text-aio-silver"}`}>
                  {n.status.replaceAll("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
