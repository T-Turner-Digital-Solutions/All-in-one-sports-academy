import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waivers" };

const REQUIRED_TYPES = ["PARTICIPATION", "LIABILITY_RELEASE", "PARENT_GUARDIAN_CONSENT", "MEDICAL_ACKNOWLEDGMENT", "PHOTO_VIDEO_RELEASE"];

export default async function WaiversPage() {
  const session = await auth();
  const householdId = session!.user.householdId!;

  const athletes = await prisma.athlete.findMany({
    where: { householdId, isActive: true },
    include: { waivers: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Waivers</h1>
      <div className="mt-6 space-y-4">
        {athletes.map((a) => {
          const signedTypes = new Set(a.waivers.map((w) => w.type));
          const missing = REQUIRED_TYPES.filter((t) => !signedTypes.has(t as never));
          return (
            <Link key={a.id} href={`/dashboard/athletes/${a.id}`} className="aio-card block p-5">
              <p className="font-display font-bold">
                {a.firstName} {a.lastName}
              </p>
              <p className={`mt-1 text-xs uppercase tracking-wide ${missing.length === 0 ? "text-green-500" : "text-aio-red"}`}>
                {missing.length === 0 ? "All waivers signed" : `${missing.length} waiver(s) needed`}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
