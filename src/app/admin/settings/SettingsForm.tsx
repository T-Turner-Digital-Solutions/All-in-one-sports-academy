"use client";

import { useActionState } from "react";
import { updateSettingsAction, type ActionState } from "@/lib/actions/adminSettings";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function SettingsForm({ singleSessionPriceCents }: { singleSessionPriceCents: number }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="aio-card grid gap-4 p-6 sm:grid-cols-3">
      <div>
        <label className={label}>Price Per Hour (cents)</label>
        <input name="single_session_price_cents" type="number" defaultValue={singleSessionPriceCents} className={input} />
      </div>
      {state.error ? <p className="text-sm text-aio-red sm:col-span-3">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500 sm:col-span-3">Settings saved.</p> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-3">
        {pending ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
