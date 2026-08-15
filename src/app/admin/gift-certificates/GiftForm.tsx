"use client";

import { useActionState } from "react";
import { createGiftCertificateAction, type ActionState } from "@/lib/actions/adminPromosAndGifts";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreateGiftForm() {
  const [state, formAction, pending] = useActionState(createGiftCertificateAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";
  return (
    <form action={formAction} className="aio-card flex flex-wrap items-end gap-3 p-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Code</label>
        <input name="code" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Value (cents)</label>
        <input name="initialValueCents" type="number" min={1} required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Recipient Email</label>
        <input name="recipientEmail" type="email" className={input} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating..." : "+ Create Gift Certificate"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}
