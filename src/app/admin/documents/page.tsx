import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documents" };

export default async function AdminDocumentsPage() {
  const documents = await prisma.contractorDocument.findMany({
    include: { application: true },
    orderBy: { uploadedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Documents</h1>
      <p className="mt-1 text-aio-silver">Coaching application documents (resumes, certifications, agreements, IDs).</p>
      <div className="mt-6 space-y-2">
        {documents.map((d) => (
          <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="aio-card block p-4 text-sm hover:border-aio-red">
            <span className="font-semibold">{d.application.fullName}</span> — {d.type.replaceAll("_", " ")} — {d.fileName}
          </a>
        ))}
        {documents.length === 0 ? <p className="text-sm text-aio-silver">No documents on file yet.</p> : null}
      </div>
    </div>
  );
}
