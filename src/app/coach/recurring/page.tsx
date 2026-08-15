import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recurring Clients" };

export default async function CoachRecurringPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const recurring = await prisma.recurringAppointment.findMany({
    where: { coachId, status: "ACTIVE" },
    include: { athlete: true, sport: true },
    orderBy: { startDate: "asc" },
  });

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Recurring Clients</h1>
      <p className="mt-1 text-aio-silver">Standing weekly appointments reserved by Academy admin.</p>
      <div className="mt-6 space-y-3">
        {recurring.length === 0 ? (
          <p className="text-sm text-aio-silver">No recurring training arrangements yet.</p>
        ) : (
          recurring.map((r) => (
            <div key={r.id} className="aio-card p-4">
              <p className="font-display font-semibold">
                {r.athlete.firstName} {r.athlete.lastName} — {r.sport.name}
              </p>
              <p className="text-xs text-aio-silver">
                {DAYS[r.dayOfWeek]} {r.startTime}–{r.endTime} · {r.frequency} · {r.paymentArrangement.replaceAll("_", " ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
