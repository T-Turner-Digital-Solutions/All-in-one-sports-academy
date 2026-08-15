"use client";

import { useActionState } from "react";
import { updateCoachBioAction, type ActionState } from "@/lib/actions/coachProfile";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function BioForm({ bio }: { bio: string }) {
  const [state, formAction, pending] = useActionState(updateCoachBioAction, initialState);
  return (
    <form action={formAction} className="aio-card space-y-4 p-6">
      <p className="font-display text-lg font-bold">Public Bio</p>
      <textarea
        name="bio"
        defaultValue={bio}
        rows={4}
        className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red"
      />
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save Bio"}
      </Button>
    </form>
  );
}
