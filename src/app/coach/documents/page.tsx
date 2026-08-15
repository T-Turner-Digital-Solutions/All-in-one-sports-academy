import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documents" };

export default async function CoachDocumentsPage() {
  const session = await auth();

  const application = await prisma.contractorApplication.findUnique({
    where: { userId: session!.user.id },
    include: { documents: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Documents</h1>
      <p className="mt-1 text-aio-silver">Documents submitted with your coaching application.</p>
      <div className="mt-6 space-y-2">
        {!application || application.documents.length === 0 ? (
          <p className="text-sm text-aio-silver">No documents on file.</p>
        ) : (
          application.documents.map((d) => (
            <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="aio-card block p-4 text-sm hover:border-aio-red">
              {d.type.replaceAll("_", " ")} — {d.fileName}
            </a>
          ))
        )}
      </div>
    </div>
  );
}
