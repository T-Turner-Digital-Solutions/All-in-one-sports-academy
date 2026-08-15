import { prisma } from "@/lib/prisma";
import { CreateProgramForm, TogglePublishButton } from "./ProgramForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Programs" };

export default async function AdminProgramsPage() {
  const [programs, sports] = await Promise.all([
    prisma.trainingProgram.findMany({ orderBy: { sortOrder: "asc" }, include: { sport: true } }),
    prisma.sport.findMany({ where: { isPublished: true } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold">Training Programs</h1>
      <CreateProgramForm sports={sports.map((s) => ({ id: s.id, label: s.name }))} />
      <div className="space-y-3">
        {programs.map((p) => (
          <div key={p.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">{p.name}</p>
              <p className="text-xs text-aio-silver">
                {p.sport?.name ?? "All Sports"} · {p.isPublished ? "Published" : "Hidden"}
              </p>
            </div>
            <TogglePublishButton programId={p.id} isPublished={p.isPublished} />
          </div>
        ))}
      </div>
    </div>
  );
}
