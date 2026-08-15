"use client";

import { useActionState } from "react";
import { updateCoachCompensationAction, setCoachStatusAction, toggleCoachSportAction, type ActionState } from "@/lib/actions/adminCoaches";
import { Button } from "@/components/ui/Button";
import type { CoachStatus } from "@prisma/client";

const initialState: ActionState = {};

export function CompensationForm({
  coachId,
  compensationType,
  flatAmountCents,
  percentageBps,
  hourlyRateCents,
  compensationNotes,
}: {
  coachId: string;
  compensationType: string;
  flatAmountCents: number | null;
  percentageBps: number | null;
  hourlyRateCents: number | null;
  compensationNotes: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateCoachCompensationAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="coachId" value={coachId} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Compensation Type</label>
        <select name="compensationType" defaultValue={compensationType} className={input}>
          <option value="FLAT_PER_SESSION">Flat Amount per Session</option>
          <option value="PERCENTAGE">Percentage of Session Price</option>
          <option value="HOURLY">Hourly Amount</option>
          <option value="CUSTOM">Custom Agreement</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Flat $ (cents)</label>
          <input name="flatAmountCents" type="number" defaultValue={flatAmountCents ?? ""} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Percentage (bps, 6000=60%)</label>
          <input name="percentageBps" type="number" defaultValue={percentageBps ?? ""} className={input} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Hourly $ (cents)</label>
          <input name="hourlyRateCents" type="number" defaultValue={hourlyRateCents ?? ""} className={input} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Notes</label>
        <textarea name="compensationNotes" defaultValue={compensationNotes ?? ""} rows={2} className={`${input} w-full`} />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save Compensation"}
      </Button>
    </form>
  );
}

export function StatusButtons({ coachId, status }: { coachId: string; status: CoachStatus }) {
  const options: CoachStatus[] = ["ACTIVE", "SUSPENDED", "INACTIVE"];
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <form key={o} action={async () => setCoachStatusAction(coachId, o)}>
          <Button type="submit" size="sm" variant={status === o ? "primary" : "outline"}>
            {o}
          </Button>
        </form>
      ))}
    </div>
  );
}

export function SportToggle({ coachId, sportId, sportName, active }: { coachId: string; sportId: string; sportName: string; active: boolean }) {
  return (
    <form action={async () => toggleCoachSportAction(coachId, sportId)}>
      <Button type="submit" size="sm" variant={active ? "primary" : "outline"}>
        {sportName}
      </Button>
    </form>
  );
}
