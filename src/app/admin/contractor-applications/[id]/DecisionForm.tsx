"use client";

import { useActionState } from "react";
import { updateContractorApplicationStatusAction, type ActionState } from "@/lib/actions/adminContractors";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

export function DecisionForm({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(updateContractorApplicationStatusAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Reviewer Notes</label>
        <textarea name="reviewerNotes" rows={2} className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red" />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Status updated.</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="APPROVED" size="sm" disabled={pending}>
          Approve
        </Button>
        <Button type="submit" name="status" value="MORE_INFO_REQUIRED" size="sm" variant="outline" disabled={pending}>
          Request More Info
        </Button>
        <Button type="submit" name="status" value="DENIED" size="sm" variant="outline" disabled={pending}>
          Deny
        </Button>
        <Button type="submit" name="status" value="SUSPENDED" size="sm" variant="ghost" disabled={pending}>
          Suspend
        </Button>
        <Button type="submit" name="status" value="INACTIVE" size="sm" variant="ghost" disabled={pending}>
          Deactivate
        </Button>
        <Button type="submit" name="status" value="ACTIVE" size="sm" variant="ghost" disabled={pending}>
          Reactivate
        </Button>
      </div>
    </form>
  );
}
