"use client";

import { useActionState, useState } from "react";
import {
  reassignCoachAction,
  adminCancelAppointmentAction,
  adminRescheduleAppointmentAction,
  type ActionState,
} from "@/lib/actions/adminAppointments";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function ReassignCoachForm({ appointmentId, qualifiedCoaches }: { appointmentId: string; qualifiedCoaches: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(reassignCoachAction, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <select name="newCoachId" required className="border border-white/15 bg-aio-black px-3 py-2 text-sm">
        <option value="">Select qualified coach</option>
        {qualifiedCoaches.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Reassigning..." : "Reassign Coach"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="w-full text-xs text-green-500">Coach reassigned.</p> : null}
    </form>
  );
}

export function AdminCancelForm({ appointmentId }: { appointmentId: string }) {
  const [state, formAction, pending] = useActionState(adminCancelAppointmentAction, initialState);
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <textarea
        name="reason"
        required
        placeholder="Cancellation reason (client receives a training credit)"
        rows={2}
        className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm"
      />
      {state.error ? <p className="text-xs text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-green-500">Cancelled — credit issued.</p> : null}
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Cancelling..." : "Cancel & Issue Credit"}
      </Button>
    </form>
  );
}

export function AdminRescheduleForm({ appointmentId, coachId }: { appointmentId: string; coachId: string }) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(adminRescheduleAppointmentAction, initialState);

  async function loadSlots(date: string) {
    setSelectedDate(date);
    const res = await fetch(`/api/booking/availability?coachId=${coachId}&date=${date}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
  }

  return (
    <div className="space-y-3">
      <input type="date" value={selectedDate} onChange={(e) => loadSlots(e.target.value)} className="border border-white/15 bg-aio-black px-3 py-2 text-sm" />
      <div className="flex flex-wrap gap-2">
        {slots.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setChosen(s)}
            className={`border px-3 py-1 text-xs ${chosen === s ? "border-aio-red text-aio-red" : "border-white/15"}`}
          >
            {new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </button>
        ))}
      </div>
      <form action={formAction}>
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="newStartsAt" value={chosen ?? ""} />
        {state.error ? <p className="text-xs text-aio-red">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-green-500">Rescheduled (72-hour rule overridden).</p> : null}
        <Button type="submit" size="sm" variant="outline" disabled={!chosen || pending}>
          {pending ? "Rescheduling..." : "Admin Reschedule (Override 72h Rule)"}
        </Button>
      </form>
    </div>
  );
}
