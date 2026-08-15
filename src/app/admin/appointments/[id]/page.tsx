import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCents } from "@/lib/format";
import { ReassignCoachForm, AdminCancelForm, AdminRescheduleForm } from "./AdminAppointmentControls";

export const dynamic = "force-dynamic";

export default async function AdminAppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      athlete: true,
      household: { include: { members: true } },
      sport: true,
      coach: { include: { user: true } },
      payment: true,
    },
  });
  if (!appointment) notFound();

  const qualifiedCoaches = await prisma.coachSport.findMany({
    where: { sportId: appointment.sportId, coach: { status: "ACTIVE" } },
    include: { coach: { include: { user: true } } },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">{appointment.status.replaceAll("_", " ")}</p>
        <h1 className="mt-1 text-3xl font-bold">{formatDateTime(appointment.startsAt)}</h1>
        <p className="mt-2 text-aio-silver">
          {appointment.athlete.firstName} {appointment.athlete.lastName} · {appointment.sport.name} · Coach{" "}
          {appointment.coach.user.firstName} {appointment.coach.user.lastName}
        </p>
        <p className="text-aio-silver">Household: {appointment.household.members.map((m) => m.email).join(", ")}</p>
        {appointment.payment ? (
          <p className="mt-2 text-sm text-aio-silver">
            {formatCents(appointment.payment.amountCents)} — {appointment.payment.status}
          </p>
        ) : null}
      </div>

      {["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(appointment.status) ? (
        <>
          <section className="aio-card p-6">
            <p className="font-display text-lg font-bold">Reassign Coach</p>
            <p className="mt-1 text-xs text-aio-silver">Only coaches qualified for {appointment.sport.name} and active are shown.</p>
            <div className="mt-4">
              <ReassignCoachForm
                appointmentId={appointment.id}
                qualifiedCoaches={qualifiedCoaches
                  .filter((c) => c.coachId !== appointment.coachId)
                  .map((c) => ({ id: c.coachId, name: `${c.coach.user.firstName} ${c.coach.user.lastName}` }))}
              />
            </div>
          </section>

          <section className="aio-card p-6">
            <p className="font-display text-lg font-bold">Reschedule (Admin Override)</p>
            <div className="mt-4">
              <AdminRescheduleForm appointmentId={appointment.id} coachId={appointment.coachId} />
            </div>
          </section>

          <section className="aio-card p-6">
            <p className="font-display text-lg font-bold">Cancel Session</p>
            <p className="mt-1 text-xs text-aio-silver">
              Cancelling as the Academy/coach automatically converts the client&apos;s payment into a
              transferable training credit.
            </p>
            <div className="mt-4">
              <AdminCancelForm appointmentId={appointment.id} />
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
