"use client";

import { useActionState } from "react";
import { updateAttendanceAction, saveSessionNoteAction, type ActionState } from "@/lib/actions/coaching";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

const ATTENDANCE_OPTIONS = [
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CLIENT_CANCELLED",
  "COACH_CANCELLED",
  "LATE_CANCELLATION",
  "NO_SHOW",
];

export function AttendanceControl({ appointmentId, currentStatus }: { appointmentId: string; currentStatus: string }) {
  const [state, formAction, pending] = useActionState(updateAttendanceAction, initialState);
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="border border-white/15 bg-aio-black px-3 py-2 text-sm"
      >
        {ATTENDANCE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating..." : "Update Status"}
      </Button>
      {state.success ? <span className="text-xs text-green-500">Updated</span> : null}
    </form>
  );
}

export function SessionNoteForm({
  appointmentId,
  note,
}: {
  appointmentId: string;
  note: {
    skillsTrained: string | null;
    strengths: string | null;
    areasForImprovement: string | null;
    drillsCompleted: string | null;
    atHomeAssignments: string | null;
    coachComments: string | null;
    nextSessionRecommendation: string | null;
    internalNotes: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(saveSessionNoteAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <div>
        <label className={label}>Skills Trained</label>
        <textarea name="skillsTrained" defaultValue={note?.skillsTrained ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Strengths</label>
        <textarea name="strengths" defaultValue={note?.strengths ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Areas for Improvement</label>
        <textarea name="areasForImprovement" defaultValue={note?.areasForImprovement ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Drills Completed</label>
        <textarea name="drillsCompleted" defaultValue={note?.drillsCompleted ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>At-Home Assignment</label>
        <textarea name="atHomeAssignments" defaultValue={note?.atHomeAssignments ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Coach Comments</label>
        <textarea name="coachComments" defaultValue={note?.coachComments ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Recommendation for Next Session</label>
        <textarea name="nextSessionRecommendation" defaultValue={note?.nextSessionRecommendation ?? ""} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Internal Notes (never shown to client)</label>
        <textarea name="internalNotes" defaultValue={note?.internalNotes ?? ""} rows={2} className={input} />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save Session Note"}
      </Button>
    </form>
  );
}
