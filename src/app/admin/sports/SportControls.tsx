"use client";

import { useActionState } from "react";
import { createSportAction, toggleSportPublishedAction, deleteSportAction, type ActionState } from "@/lib/actions/adminSports";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreateSportForm() {
  const [state, formAction, pending] = useActionState(createSportAction, initialState);
  return (
    <form action={formAction} className="aio-card flex flex-wrap items-end gap-3 p-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Sport Name</label>
        <input name="name" required className="border border-white/15 bg-aio-black px-3 py-2 text-sm" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Description</label>
        <input name="description" className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm" />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "+ Add Sport"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}

export function TogglePublishButton({ sportId, isPublished }: { sportId: string; isPublished: boolean }) {
  return (
    <form action={async () => toggleSportPublishedAction(sportId)}>
      <Button type="submit" size="sm" variant="outline">
        {isPublished ? "Hide" : "Publish"}
      </Button>
    </form>
  );
}

export function DeleteSportButton({ sportId }: { sportId: string }) {
  return (
    <form action={async () => deleteSportAction(sportId)}>
      <Button type="submit" size="sm" variant="ghost">
        Remove
      </Button>
    </form>
  );
}
