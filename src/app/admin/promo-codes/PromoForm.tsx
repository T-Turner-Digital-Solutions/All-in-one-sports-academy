"use client";

import { useActionState } from "react";
import { createPromoCodeAction, togglePromoCodeAction, type ActionState } from "@/lib/actions/adminPromosAndGifts";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreatePromoForm() {
  const [state, formAction, pending] = useActionState(createPromoCodeAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";
  return (
    <form action={formAction} className="aio-card flex flex-wrap items-end gap-3 p-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Code</label>
        <input name="code" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Discount Type</label>
        <select name="discountType" className={input}>
          <option value="PERCENTAGE">Percentage</option>
          <option value="FIXED">Fixed Amount</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">% Off</label>
        <input name="percentOff" type="number" min={1} max={100} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">$ Off (cents)</label>
        <input name="amountOffCents" type="number" min={1} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Max Uses</label>
        <input name="maxUses" type="number" min={1} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Expires</label>
        <input name="expiresAt" type="date" className={input} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating..." : "+ Create Code"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}

export function TogglePromoButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={async () => togglePromoCodeAction(id)}>
      <Button type="submit" size="sm" variant="outline">
        {isActive ? "Disable" : "Enable"}
      </Button>
    </form>
  );
}
