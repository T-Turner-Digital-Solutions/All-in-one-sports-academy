"use client";

import { useActionState } from "react";
import { saveWebsiteContentAction, type ActionState } from "@/lib/actions/adminContent";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function ContentEditor({ contentKey, label, value }: { contentKey: string; label: string; value: string }) {
  const [state, formAction, pending] = useActionState(saveWebsiteContentAction, initialState);
  return (
    <form action={formAction} className="aio-card space-y-3 p-5">
      <input type="hidden" name="key" value={contentKey} />
      <p className="font-display font-bold">{label}</p>
      <textarea
        name="value"
        defaultValue={value}
        rows={2}
        className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red"
      />
      {state.error ? <p className="text-xs text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-green-500">Saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
