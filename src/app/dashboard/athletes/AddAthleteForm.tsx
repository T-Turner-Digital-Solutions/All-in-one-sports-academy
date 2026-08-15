"use client";

import { useActionState, useState } from "react";
import { createAthleteAction, type AthleteFormState } from "@/lib/actions/athletes";
import { Button } from "@/components/ui/Button";

const initialState: AthleteFormState = {};

export function AddAthleteForm({ sports }: { sports: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAthleteAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + Add Athlete
      </Button>
    );
  }

  if (state.success) {
    return (
      <div className="aio-card p-6">
        <p className="font-display font-bold text-aio-red">Athlete Added</p>
        <Button size="sm" className="mt-4" onClick={() => window.location.reload()}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="aio-card space-y-4 p-6">
      <p className="font-display text-lg font-bold">Add Athlete</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>First Name</label>
          <input name="firstName" required className={input} />
        </div>
        <div>
          <label className={label}>Last Name</label>
          <input name="lastName" required className={input} />
        </div>
        <div>
          <label className={label}>Date of Birth</label>
          <input name="dob" type="date" required className={input} />
        </div>
        <div>
          <label className={label}>Primary Sport</label>
          <select name="primarySportId" className={input}>
            <option value="">Select a sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>School</label>
          <input name="school" className={input} />
        </div>
        <div>
          <label className={label}>Team</label>
          <input name="team" className={input} />
        </div>
        <div>
          <label className={label}>Position</label>
          <input name="position" className={input} />
        </div>
        <div>
          <label className={label}>Experience Level</label>
          <select name="experienceLevel" className={input}>
            <option value="">Select</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="ELITE">Elite</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Development Goals</label>
        <textarea name="developmentGoals" rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Injuries / Restrictions</label>
        <textarea name="injuriesRestrictions" rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Medical Information Relevant to Participation</label>
        <textarea name="medicalNotes" rows={2} className={input} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Emergency Contact Name</label>
          <input name="emergencyContactName" className={input} />
        </div>
        <div>
          <label className={label}>Emergency Contact Phone</label>
          <input name="emergencyContactPhone" type="tel" className={input} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-aio-silver-light">
        <input type="checkbox" name="photoVideoRelease" value="true" className="h-4 w-4" />
        I consent to photo/video release for this athlete
      </label>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <div className="flex gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save Athlete"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
