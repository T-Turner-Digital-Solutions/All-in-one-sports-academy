import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateAge } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Athletes" };

export default async function CoachAthletesPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const athleteIds = await prisma.appointment.findMany({
    where: { coachId },
    distinct: ["athleteId"],
    select: { athleteId: true },
  });

  const athletes = await prisma.athlete.findMany({
    where: { id: { in: athleteIds.map((a) => a.athleteId) } },
    include: { primarySport: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">My Athletes</h1>
      <p className="mt-1 text-aio-silver">Athletes you&apos;ve trained or have upcoming sessions with.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.length === 0 ? (
          <p className="text-sm text-aio-silver">No athletes assigned yet.</p>
        ) : (
          athletes.map((a) => (
            <Link key={a.id} href={`/coach/athletes/${a.id}`} className="aio-card p-5">
              <p className="font-display text-lg font-bold">
                {a.firstName} {a.lastName}
              </p>
              <p className="text-xs text-aio-silver">
                Age {calculateAge(a.dob)} {a.primarySport ? `· ${a.primarySport.name}` : ""}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
