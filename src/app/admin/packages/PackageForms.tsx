"use client";

import { useActionState } from "react";
import { createPackageAction, togglePackageActiveAction, type ActionState } from "@/lib/actions/adminCatalog";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreatePackageForm() {
  const [state, formAction, pending] = useActionState(createPackageAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm w-full";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";
  return (
    <form action={formAction} className="aio-card grid gap-4 p-6 sm:grid-cols-2">
      <div>
        <label className={label}>Package Name</label>
        <input name="name" required className={input} />
      </div>
      <div>
        <label className={label}>Type</label>
        <select name="type" className={input}>
          <option value="MULTI_SESSION">Multi-Session</option>
          <option value="MONTHLY">Monthly Training</option>
          <option value="GROUP">Group Training</option>
          <option value="CAMP">Camp</option>
          <option value="TEAM">Team Training</option>
          <option value="PROMOTIONAL">Promotional</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Description</label>
        <textarea name="description" rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Session Count (blank = unlimited/monthly)</label>
        <input name="sessionCount" type="number" min={1} className={input} />
      </div>
      <div>
        <label className={label}>Price (cents)</label>
        <input name="priceCents" type="number" min={0} required className={input} />
      </div>
      {state.error ? <p className="text-sm text-aio-red sm:col-span-2">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Creating..." : "+ Create Package"}
      </Button>
    </form>
  );
}

export function TogglePackageButton({ packageId, isActive }: { packageId: string; isActive: boolean }) {
  return (
    <form action={async () => togglePackageActiveAction(packageId)}>
      <Button type="submit" size="sm" variant="outline">
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </form>
  );
}
