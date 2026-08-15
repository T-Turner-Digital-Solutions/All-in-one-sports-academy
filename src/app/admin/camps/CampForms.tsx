"use client";

import { useActionState } from "react";
import { createCampAction, toggleCampPublishedAction, type ActionState } from "@/lib/actions/adminCamps";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};
type Option = { id: string; label: string };

export function CreateCampForm({ sports, locations }: { sports: Option[]; locations: Option[] }) {
  const [state, formAction, pending] = useActionState(createCampAction, initialState);
  const input = "border border-white/15 bg-aio-black px-3 py-2 text-sm w-full";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="aio-card grid gap-4 p-6 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label}>Program Name</label>
        <input name="name" required className={input} />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Description</label>
        <textarea name="description" rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Sport</label>
        <select name="sportId" className={input}>
          <option value="">All Sports</option>
          {sports.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Location</label>
        <select name="locationId" className={input}>
          <option value="">TBD</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Starts</label>
        <input name="startsAt" type="datetime-local" required className={input} />
      </div>
      <div>
        <label className={label}>Ends</label>
        <input name="endsAt" type="datetime-local" required className={input} />
      </div>
      <div>
        <label className={label}>Price (cents)</label>
        <input name="priceCents" type="number" min={0} required className={input} />
      </div>
      <div>
        <label className={label}>Max Participants</label>
        <input name="maxParticipants" type="number" min={1} required className={input} />
      </div>
      <div>
        <label className={label}>Registration Deadline</label>
        <input name="registrationDeadline" type="datetime-local" className={input} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Min Age</label>
          <input name="minAge" type="number" className={input} />
        </div>
        <div>
          <label className={label}>Max Age</label>
          <input name="maxAge" type="number" className={input} />
        </div>
      </div>
      {state.error ? <p className="text-sm text-aio-red sm:col-span-2">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="sm:col-span-2">
        {pending ? "Creating..." : "+ Create Camp/Clinic"}
      </Button>
    </form>
  );
}

export function TogglePublishButton({ campId, isPublished }: { campId: string; isPublished: boolean }) {
  return (
    <form action={async () => toggleCampPublishedAction(campId)}>
      <Button type="submit" size="sm" variant="outline">
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
    </form>
  );
}
