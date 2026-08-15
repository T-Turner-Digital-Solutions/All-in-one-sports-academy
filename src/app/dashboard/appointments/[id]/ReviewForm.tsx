"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewState } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/Button";

const initialState: ReviewState = {};

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);

  if (state.success) {
    return <p className="text-sm text-green-500">Thanks for the feedback! It&apos;s private until approved for public display.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1 text-2xl text-aio-red">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            {n <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
      <textarea
        name="feedback"
        rows={3}
        placeholder="How did the session go?"
        className="w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red"
      />
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  );
}
