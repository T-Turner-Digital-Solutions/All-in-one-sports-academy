"use client";

import { useActionState } from "react";
import { createLocationAction, toggleLocationActiveAction, type ActionState } from "@/lib/actions/adminLocations";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreateLocationForm() {
  const [state, formAction, pending] = useActionState(createLocationAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";
  return (
    <form action={formAction} className="aio-card grid gap-4 p-6 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Facility Name</label>
        <input name="name" required className={`${input} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Address</label>
        <input name="address" required className={`${input} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">City</label>
        <input name="city" required className={`${input} w-full`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">State</label>
          <input name="state" required className={`${input} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Zip</label>
          <input name="zip" required className={`${input} w-full`} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Hours</label>
        <input name="hours" className={`${input} w-full`} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Check-in Instructions</label>
        <input name="instructions" className={`${input} w-full`} />
      </div>
      {state.error ? <p className="text-sm text-aio-red sm:col-span-2">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Adding..." : "+ Add Location"}
      </Button>
    </form>
  );
}

export function ToggleLocationButton({ locationId, isActive }: { locationId: string; isActive: boolean }) {
  return (
    <form action={async () => toggleLocationActiveAction(locationId)}>
      <Button type="submit" size="sm" variant="outline">
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}
