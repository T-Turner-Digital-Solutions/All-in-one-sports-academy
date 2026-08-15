"use client";

import { useActionState, useEffect, useState } from "react";
import { rescheduleAppointmentAction, type RescheduleState } from "@/lib/actions/appointments";
import { Button } from "@/components/ui/Button";

const initialState: RescheduleState = {};

export function RescheduleWidget({ appointmentId, coachId }: { appointmentId: string; coachId: string }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(rescheduleAppointmentAction, initialState);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/booking/availability?coachId=${coachId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [open, coachId, selectedDate]);

  if (state.success) {
    return <p className="text-sm text-green-500">Session rescheduled! Refresh to see your new time.</p>;
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Reschedule My Session
      </Button>
    );
  }

  return (
    <div className="aio-card mt-4 space-y-4 p-5">
      <p className="font-display font-bold">Choose a New Time</p>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => {
          setSelectedDate(e.target.value);
          setChosen(null);
        }}
        min={new Date().toISOString().slice(0, 10)}
        className="border border-white/15 bg-aio-black px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.length === 0 ? (
          <p className="col-span-full text-sm text-aio-silver">No openings on this date.</p>
        ) : (
          slots.map((s) => (
            <button
              key={s}
              onClick={() => setChosen(s)}
              className={`border px-3 py-2 text-sm ${chosen === s ? "border-aio-red text-aio-red" : "border-white/15"}`}
            >
              {new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </button>
          ))
        )}
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <form action={formAction} className="flex gap-3">
        <input type="hidden" name="appointmentId" value={appointmentId} />
        <input type="hidden" name="newStartsAt" value={chosen ?? ""} />
        <Button type="submit" size="sm" disabled={!chosen || pending}>
          {pending ? "Rescheduling..." : "Confirm New Time"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </form>
    </div>
  );
}
