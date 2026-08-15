"use client";

import { useActionState } from "react";
import { addEvaluationAction, type ActionState } from "@/lib/actions/coaching";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

const COMMON_METRICS = [
  { key: "40yd_dash_sec", label: "40-Yard Dash (sec)" },
  { key: "vertical_jump_in", label: "Vertical Jump (in)" },
  { key: "shooting_pct", label: "Shooting %" },
  { key: "agility_score", label: "Agility Score" },
];

export function EvaluationForm({ athleteId }: { athleteId: string }) {
  const [state, formAction, pending] = useActionState(addEvaluationAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="athleteId" value={athleteId} />
      <div className="grid gap-4 sm:grid-cols-2">
        {COMMON_METRICS.map((m) => (
          <div key={m.key}>
            <label className={label}>{m.label}</label>
            <input name={`metric_${m.key}`} className={input} />
          </div>
        ))}
      </div>
      <div>
        <label className={label}>Coach Rating (1-5)</label>
        <input name="coachRating" type="number" min={1} max={5} className={input} />
      </div>
      <div>
        <label className={label}>Notes</label>
        <textarea name="notes" rows={2} className={input} />
      </div>
      <label className="flex items-center gap-2 text-xs text-aio-silver">
        <input type="checkbox" name="isBaseline" value="true" /> Mark as baseline evaluation
      </label>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Evaluation saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save Evaluation"}
      </Button>
    </form>
  );
}
