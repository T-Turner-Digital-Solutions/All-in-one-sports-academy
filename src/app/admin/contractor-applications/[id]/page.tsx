import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { DecisionForm } from "./DecisionForm";

export const dynamic = "force-dynamic";

export default async function ContractorApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await prisma.contractorApplication.findUnique({
    where: { id },
    include: { documents: true, user: true },
  });
  if (!application) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
          {application.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{application.fullName}</h1>
        <p className="text-aio-silver">
          {application.email} · {application.phone} · Submitted {formatDate(application.submittedAt)}
        </p>
      </div>

      <section className="aio-card grid gap-4 p-6 text-sm sm:grid-cols-2">
        <Field label="Address" value={application.address} />
        <Field label="Sports Coached" value={application.sportsCoached.join(", ")} />
        <Field label="Specialties" value={application.trainingSpecialties} />
        <Field label="Positions Trained" value={application.positionsTrained} />
        <Field label="Years of Experience" value={application.yearsExperience?.toString()} />
        <Field label="CPR/First Aid" value={application.cprFirstAid ? "Yes" : "No"} />
        <Field label="Availability" value={application.availability} />
        <Field label="Preferred Location" value={application.preferredLocation} />
        <Field label="Emergency Contact" value={`${application.emergencyContactName ?? "—"} (${application.emergencyContactPhone ?? "—"})`} />
        <Field label="Background Check Authorized" value={application.backgroundCheckAuthorized ? "Yes" : "No"} />
      </section>

      <section className="aio-card p-6 text-sm">
        <p className="font-display text-lg font-bold">Biography</p>
        <p className="mt-2 text-aio-silver">{application.biography || "—"}</p>
        <p className="mt-4 font-display text-lg font-bold">Coaching History</p>
        <p className="mt-2 text-aio-silver">{application.coachingHistory || "—"}</p>
        <p className="mt-4 font-display text-lg font-bold">Certifications</p>
        <p className="mt-2 text-aio-silver">{application.certifications || "—"}</p>
        <p className="mt-4 font-display text-lg font-bold">References</p>
        <p className="mt-2 whitespace-pre-line text-aio-silver">{application.references || "—"}</p>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Documents</p>
        <div className="mt-4 space-y-2">
          {application.documents.length === 0 ? (
            <p className="text-sm text-aio-silver">No documents uploaded.</p>
          ) : (
            application.documents.map((d) => (
              <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="block text-sm text-aio-red hover:underline">
                {d.type.replaceAll("_", " ")} — {d.fileName}
              </a>
            ))
          )}
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Review Decision</p>
        <div className="mt-4">
          <DecisionForm applicationId={application.id} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-aio-silver">{label}</p>
      <p className="mt-1">{value || "—"}</p>
    </div>
  );
}
