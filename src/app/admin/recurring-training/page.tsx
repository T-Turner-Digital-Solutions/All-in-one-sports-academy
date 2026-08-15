import { prisma } from "@/lib/prisma";
import { RecurringForm, CancelRecurringButton } from "./RecurringForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recurring Training" };

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function AdminRecurringTrainingPage() {
  const [recurring, athletes, coaches, sports] = await Promise.all([
    prisma.recurringAppointment.findMany({
      where: { status: "ACTIVE" },
      include: { athlete: true, coach: { include: { user: true } }, sport: true },
      orderBy: { startDate: "desc" },
    }),
    prisma.athlete.findMany({ where: { isActive: true }, include: { household: true } }),
    prisma.coach.findMany({ where: { status: "ACTIVE" }, include: { user: true } }),
    prisma.sport.findMany({ where: { isPublished: true } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Recurring Training</h1>
        <p className="mt-1 text-aio-silver">
          Reserve repeating slots for established athletes — these automatically block the public
          booking calendar.
        </p>
      </div>

      <RecurringForm
        athletes={athletes.map((a) => ({ id: a.id, label: `${a.firstName} ${a.lastName} (${a.household.name})` }))}
        coaches={coaches.map((c) => ({ id: c.id, label: `${c.user.firstName} ${c.user.lastName}` }))}
        sports={sports.map((s) => ({ id: s.id, label: s.name }))}
      />

      <div className="space-y-3">
        {recurring.map((r) => (
          <div key={r.id} className="aio-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-display font-bold">
                {r.athlete.firstName} {r.athlete.lastName} — {r.sport.name}
              </p>
              <p className="text-xs text-aio-silver">
                Coach {r.coach.user.firstName} {r.coach.user.lastName} · {DAYS[r.dayOfWeek]} {r.startTime}-{r.endTime} ·{" "}
                {r.frequency}
              </p>
            </div>
            <CancelRecurringButton recurringId={r.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
