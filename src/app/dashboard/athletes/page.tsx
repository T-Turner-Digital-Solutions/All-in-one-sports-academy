import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateAge } from "@/lib/format";
import { AddAthleteForm } from "./AddAthleteForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Athletes" };

export default async function AthletesPage() {
  const session = await auth();
  const householdId = session!.user.householdId!;

  const [athletes, sports] = await Promise.all([
    prisma.athlete.findMany({
      where: { householdId, isActive: true },
      include: { primarySport: true, waivers: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sport.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Athletes</h1>
      </div>
      <p className="mt-1 text-aio-silver">Manage every athlete in your household from one place.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {athletes.map((a) => {
          const hasWaiver = a.waivers.some((w) => w.type === "PARTICIPATION");
          return (
            <Link key={a.id} href={`/dashboard/athletes/${a.id}`} className="aio-card block p-5">
              <p className="font-display text-lg font-bold">
                {a.firstName} {a.lastName}
              </p>
              <p className="text-xs text-aio-silver">
                Age {calculateAge(a.dob)} {a.primarySport ? `· ${a.primarySport.name}` : ""}
              </p>
              <p className={`mt-3 text-xs uppercase tracking-wide ${hasWaiver ? "text-green-500" : "text-aio-red"}`}>
                {hasWaiver ? "Waiver Signed" : "Waiver Needed"}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <AddAthleteForm sports={sports.map((s) => ({ id: s.id, name: s.name }))} />
      </div>
    </div>
  );
}
