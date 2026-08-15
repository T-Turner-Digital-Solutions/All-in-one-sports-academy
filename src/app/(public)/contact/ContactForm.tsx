"use client";

import { useActionState } from "react";
import { submitContactAction, type ContactState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";

const initialState: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactAction, initialState);

  if (state.success) {
    return (
      <div className="aio-card p-8 text-center">
        <p className="font-display text-xl font-bold">Message Sent</p>
        <p className="mt-2 text-aio-silver">Thanks for reaching out — the Academy team will respond soon.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Name</label>
          <input name="name" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Email</label>
          <input name="email" type="email" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Phone (optional)</label>
        <input name="phone" type="tel" className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Message</label>
        <textarea name="message" required rows={5} className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
