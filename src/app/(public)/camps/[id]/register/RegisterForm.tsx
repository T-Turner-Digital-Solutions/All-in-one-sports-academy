"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerForCampAction, type CampRegisterState } from "@/lib/actions/camps";
import { Button } from "@/components/ui/Button";

const initialState: CampRegisterState = {};

export function CampRegisterForm({ campId, athletes }: { campId: string; athletes: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(registerForCampAction, initialState);

  if (state.success) {
    return (
      <div className="aio-card p-8 text-center">
        <p className="font-display text-2xl font-bold text-aio-red">You&apos;re Registered!</p>
        <p className="mt-2 text-aio-silver">A confirmation email is on its way.</p>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <p className="text-aio-silver">
        Add an athlete profile from your{" "}
        <Link href="/dashboard/athletes" className="text-aio-red hover:underline">
          client dashboard
        </Link>{" "}
        before registering.
      </p>
    );
  }

  return (
    <form action={formAction} className="aio-card space-y-4 p-6">
      <input type="hidden" name="campId" value={campId} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Athlete</label>
        <select name="athleteId" required className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm">
          {athletes.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Registering..." : "Confirm Registration & Pay"}
      </Button>
    </form>
  );
}
