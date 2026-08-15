"use client";

import { useActionState } from "react";
import { signWaiverAction, type SignWaiverState } from "@/lib/actions/waivers";
import { Button } from "@/components/ui/Button";

const initialState: SignWaiverState = {};

const LABELS: Record<string, string> = {
  PARTICIPATION: "Participation Waiver",
  LIABILITY_RELEASE: "Liability Release",
  PARENT_GUARDIAN_CONSENT: "Parent/Guardian Consent",
  MEDICAL_ACKNOWLEDGMENT: "Medical Acknowledgment",
  PHOTO_VIDEO_RELEASE: "Photo/Video Release",
};

export function WaiverSigner({ athleteId, type }: { athleteId: string; type: string }) {
  const [state, formAction, pending] = useActionState(signWaiverAction, initialState);

  if (state.success) {
    return <p className="text-sm text-green-500">{LABELS[type]} signed successfully.</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="athleteId" value={athleteId} />
      <input type="hidden" name="type" value={type} />
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Type your full legal name to sign</label>
        <input name="signedName" required className="border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red" />
      </div>
      {state.error ? <p className="text-xs text-aio-red">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Signing..." : `Sign ${LABELS[type]}`}
      </Button>
    </form>
  );
}
