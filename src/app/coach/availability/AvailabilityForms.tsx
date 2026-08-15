"use client";

import { useActionState } from "react";
import {
  addRecurringAvailabilityAction,
  addBlockedTimeAction,
  removeAvailabilityAction,
  removeBlockedTimeAction,
  type ActionState,
} from "@/lib/actions/availability";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AddAvailabilityForm({ coachId }: { coachId: string }) {
  const [state, formAction, pending] = useActionState(addRecurringAvailabilityAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="coachId" value={coachId} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Day</label>
        <select name="dayOfWeek" className={input}>
          {DAYS.map((d, i) => (
            <option key={d} value={i}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Start</label>
        <input name="startTime" type="time" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">End</label>
        <input name="endTime" type="time" required className={input} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "Add Availability"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}

export function AddBlockedTimeForm({ coachId }: { coachId: string }) {
  const [state, formAction, pending] = useActionState(addBlockedTimeAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="coachId" value={coachId} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">From</label>
        <input name="startsAt" type="datetime-local" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">To</label>
        <input name="endsAt" type="datetime-local" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Reason</label>
        <select name="reason" className={input}>
          <option value="VACATION">Vacation</option>
          <option value="TIME_OFF_REQUEST">Time Off Request</option>
          <option value="PERSONAL_APPOINTMENT">Personal Appointment</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Blocking..." : "Block Time"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}

export function RemoveAvailabilityButton({ coachId, availabilityId }: { coachId: string; availabilityId: string }) {
  return (
    <form action={async () => removeAvailabilityAction(coachId, availabilityId)}>
      <Button type="submit" size="sm" variant="ghost">
        Remove
      </Button>
    </form>
  );
}

export function RemoveBlockedTimeButton({ coachId, blockedTimeId }: { coachId: string; blockedTimeId: string }) {
  return (
    <form action={async () => removeBlockedTimeAction(coachId, blockedTimeId)}>
      <Button type="submit" size="sm" variant="ghost">
        Remove
      </Button>
    </form>
  );
}
