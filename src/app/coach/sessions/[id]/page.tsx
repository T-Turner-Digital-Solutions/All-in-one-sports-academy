import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AttendanceControl, SessionNoteForm } from "./SessionForms";

export const dynamic = "force-dynamic";

export default async function CoachSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { athlete: true, sport: true, location: true, attendance: true, sessionNote: true },
  });

  if (!appointment || appointment.coachId !== session!.user.coachId) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-red">
          {appointment.status.replaceAll("_", " ")}
        </p>
        <h1 className="mt-1 text-3xl font-bold">{formatDateTime(appointment.startsAt)}</h1>
        <p className="mt-2 text-aio-silver">
          {appointment.athlete.firstName} {appointment.athlete.lastName} — {appointment.sport.name}
        </p>
        {appointment.location ? <p className="text-aio-silver">{appointment.location.name}</p> : null}
      </div>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Attendance</p>
        <div className="mt-4">
          <AttendanceControl appointmentId={appointment.id} currentStatus={appointment.attendance?.status ?? appointment.status} />
        </div>
      </section>

      <section className="aio-card p-6">
        <p className="font-display text-lg font-bold">Session Notes</p>
        <div className="mt-4">
          <SessionNoteForm appointmentId={appointment.id} note={appointment.sessionNote} />
        </div>
      </section>
    </div>
  );
}
