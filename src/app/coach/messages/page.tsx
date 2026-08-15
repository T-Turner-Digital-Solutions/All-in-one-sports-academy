import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function CoachMessagesPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  const households = await prisma.appointment.findMany({
    where: { coachId },
    distinct: ["householdId"],
    select: { householdId: true, household: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Messages</h1>
      <div className="mt-6 space-y-2">
        {households.length === 0 ? (
          <p className="text-sm text-aio-silver">No conversations yet.</p>
        ) : (
          households.map((h) => (
            <Link key={h.householdId} href={`/coach/messages/${h.householdId}`} className="aio-card block p-4 text-sm hover:border-aio-red">
              {h.household.name}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
