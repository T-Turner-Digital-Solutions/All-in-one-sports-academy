import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatCents } from "@/lib/format";
import { canClientReschedule, CANCELLATION_POLICY_BODY } from "@/lib/policy";
import { RescheduleWidget } from "./RescheduleWidget";
import { ReviewForm } from "./ReviewForm";

export const dynamic = "force-dynamic";

export default async function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      athlete: true,
      sport: true,
      coach: { include: { user: true } },
      location: true,
      payment: true,
      review: true,
      sessionNote: true,
    },
  });

  if (!appointment || appointment.householdId !== session!.user.householdId) notFound();

  const reschedulable =
    ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(appointment.status) && canClientReschedule(appointment.startsAt);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
          {appointment.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{formatDateTime(appointment.startsAt)}</h1>
        <p className="mt-2 text-aio-silver">
          {appointment.athlete.firstName} {appointment.athlete.lastName} · {appointment.sport.name} with Coach{" "}
          {appointment.coach.user.firstName} {appointment.coach.user.lastName}
        </p>
        {appointment.location ? <p className="text-aio-silver">{appointment.location.name}</p> : null}
        {appointment.payment ? (
          <p className="mt-2 text-sm text-aio-silver">
            {formatCents(appointment.payment.amountCents)} — {appointment.payment.status}
          </p>
        ) : null}
      </div>

      {["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(appointment.status) ? (
        <section>
          {reschedulable ? (
            <RescheduleWidget appointmentId={appointment.id} coachId={appointment.coachId} />
          ) : (
            <p className="text-sm text-aio-red">
              Rescheduling is locked — this session starts in less than 72 hours. Contact the Academy for
              an exception.
            </p>
          )}
        </section>
      ) : null}

      {appointment.status === "COMPLETED" ? (
        <section className="aio-card p-6">
          <p className="font-display text-lg font-bold">Rate This Session</p>
          {appointment.review ? (
            <p className="mt-3 text-sm text-aio-silver">
              You rated this session {appointment.review.rating}/5. Thank you for your feedback!
            </p>
          ) : (
            <div className="mt-4">
              <ReviewForm appointmentId={appointment.id} />
            </div>
          )}
        </section>
      ) : null}

      <details className="text-xs text-aio-silver">
        <summary className="cursor-pointer font-display uppercase tracking-wide">Cancellation & Rescheduling Policy</summary>
        <p className="mt-2 whitespace-pre-line">{CANCELLATION_POLICY_BODY}</p>
      </details>
    </div>
  );
}
