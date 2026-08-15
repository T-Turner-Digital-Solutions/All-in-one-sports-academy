import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Audit Log" };

export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Audit Log</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Record</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-white/5 align-top">
                <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                <td className="py-2 pr-4">{l.actor ? `${l.actor.firstName} ${l.actor.lastName}` : "System"}</td>
                <td className="py-2 pr-4">{l.action}</td>
                <td className="py-2 pr-4 text-xs text-aio-silver">
                  {l.recordType}#{l.recordId.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? <p className="mt-6 text-sm text-aio-silver">No audit entries yet.</p> : null}
      </div>
    </div>
  );
}
