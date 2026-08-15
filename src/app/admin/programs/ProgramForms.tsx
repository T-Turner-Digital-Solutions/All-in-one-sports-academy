"use client";

import { useActionState } from "react";
import { createProgramAction, toggleProgramPublishedAction, type ActionState } from "@/lib/actions/adminCatalog";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function CreateProgramForm({ sports }: { sports: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(createProgramAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm";
  return (
    <form action={formAction} className="aio-card flex flex-wrap items-end gap-3 p-5">
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Program Name</label>
        <input name="name" required className={input} />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Sport</label>
        <select name="sportId" className={input}>
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Description</label>
        <input name="description" className={`${input} w-full`} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding..." : "+ Add Program"}
      </Button>
      {state.error ? <p className="w-full text-xs text-aio-red">{state.error}</p> : null}
    </form>
  );
}

export function TogglePublishButton({ programId, isPublished }: { programId: string; isPublished: boolean }) {
  return (
    <form action={async () => toggleProgramPublishedAction(programId)}>
      <Button type="submit" size="sm" variant="outline">
        {isPublished ? "Hide" : "Publish"}
      </Button>
    </form>
  );
}
