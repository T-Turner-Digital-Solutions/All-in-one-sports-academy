"use client";

import { useActionState } from "react";
import { createRecurringAppointmentAction, cancelRecurringAppointmentAction, type ActionState } from "@/lib/actions/adminRecurring";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Option = { id: string; label: string };

export function RecurringForm({ athletes, coaches, sports }: { athletes: Option[]; coaches: Option[]; sports: Option[] }) {
  const [state, formAction, pending] = useActionState(createRecurringAppointmentAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";

  return (
    <form action={formAction} className="aio-card grid gap-4 p-6 sm:grid-cols-2">
      <Select name="athleteId" label="Athlete" options={athletes} className={input} />
      <Select name="coachId" label="Coach" options={coaches} className={input} />
      <Select name="sportId" label="Sport" options={sports} className={input} />
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
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Start Time</label>
        <input name="startTime" type="time" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">End Time</label>
        <input name="endTime" type="time" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Frequency</label>
        <select name="frequency" className={input}>
          <option value="WEEKLY">Weekly</option>
          <option value="BIWEEKLY">Every Two Weeks</option>
          <option value="MONTHLY">Monthly</option>
          <option value="CUSTOM">Custom</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Start Date</label>
        <input name="startDate" type="date" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">End Type</label>
        <select name="endType" className={input}>
          <option value="NO_END">No End Date</option>
          <option value="ON_DATE">Specific End Date</option>
          <option value="AFTER_N_SESSIONS">After N Sessions</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">End Date (if applicable)</label>
        <input name="endDate" type="date" className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Number of Sessions (if applicable)</label>
        <input name="numberOfSessions" type="number" min={1} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Payment Arrangement</label>
        <select name="paymentArrangement" className={input}>
          <option value="PAY_PER_SESSION">Pay per Session</option>
          <option value="PREPAID">Prepaid</option>
          <option value="PACKAGE">Package</option>
          <option value="ADMIN_RESERVED">Admin Reserved</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Notes</label>
        <textarea name="notes" rows={2} className={`${input} w-full`} />
      </div>
      {state.error ? <p className="text-sm text-aio-red sm:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500 sm:col-span-2">Recurring training created and slots blocked.</p> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Creating..." : "Create Recurring Training"}
      </Button>
    </form>
  );
}

function Select({ name, label, options, className }: { name: string; label: string; options: Option[]; className: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">{label}</label>
      <select name={name} required className={className}>
        <option value="">Select {label}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CancelRecurringButton({ recurringId }: { recurringId: string }) {
  return (
    <form action={async () => cancelRecurringAppointmentAction(recurringId)}>
      <Button type="submit" size="sm" variant="ghost">
        Cancel
      </Button>
    </form>
  );
}
