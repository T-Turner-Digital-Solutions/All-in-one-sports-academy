import { auth } from "@/lib/auth";
import { AvailabilitySection } from "@/components/coach/AvailabilitySection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Availability" };

export default async function CoachAvailabilityPage() {
  const session = await auth();
  const coachId = session!.user.coachId!;

  return (
    <div>
      <h1 className="mb-10 font-display text-3xl font-bold">Availability</h1>
      <AvailabilitySection coachId={coachId} />
    </div>
  );
}
