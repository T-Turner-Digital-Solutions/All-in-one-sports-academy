"use client";

import { useActionState } from "react";
import { issuePayoutAction, type ActionState } from "@/lib/actions/adminPayouts";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function IssuePayoutButton({ coachId }: { coachId: string }) {
  const [state, formAction, pending] = useActionState(issuePayoutAction, initialState);
  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="coachId" value={coachId} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Issuing..." : "Issue Payout"}
      </Button>
      {state.error ? <p className="mt-1 text-xs text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="mt-1 text-xs text-green-500">Payout issued.</p> : null}
    </form>
  );
}
