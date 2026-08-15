import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contractor Applications" };

const STATUS_COLOR: Record<string, string> = {
  PENDING_REVIEW: "text-aio-red",
  MORE_INFO_REQUIRED: "text-yellow-500",
  APPROVED: "text-green-500",
  ACTIVE: "text-green-500",
  SUSPENDED: "text-orange-500",
  INACTIVE: "text-aio-silver",
  DENIED: "text-aio-silver",
  APPLICANT: "text-aio-silver",
};

export default async function ContractorApplicationsPage() {
  const applications = await prisma.contractorApplication.findMany({
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Contractor Applications</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-aio-silver">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Submitted</th>
              <th className="py-2 pr-4">Sports</th>
              <th className="py-2 pr-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-b border-white/5">
                <td className="py-3 pr-4">
                  <Link href={`/admin/contractor-applications/${a.id}`} className="hover:text-aio-red">
                    {a.fullName}
                  </Link>
                </td>
                <td className="py-3 pr-4">{formatDate(a.submittedAt)}</td>
                <td className="py-3 pr-4">{a.sportsCoached.join(", ")}</td>
                <td className={`py-3 pr-4 font-semibold ${STATUS_COLOR[a.status]}`}>{a.status.replaceAll("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 ? <p className="mt-6 text-sm text-aio-silver">No applications yet.</p> : null}
      </div>
    </div>
  );
}
