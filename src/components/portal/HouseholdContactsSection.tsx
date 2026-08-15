"use client";

import { useActionState } from "react";
import {
  addHouseholdContactAction,
  removeHouseholdContactAction,
  type ActionState,
} from "@/lib/actions/householdContacts";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = {};

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
};

export function HouseholdContactsSection({ householdId, contacts }: { householdId: string; contacts: Contact[] }) {
  const [state, formAction, pending] = useActionState(addHouseholdContactAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <div className="aio-card space-y-4 p-6">
      <div>
        <p className="font-display text-lg font-bold">Household Contacts</p>
        <p className="mt-1 text-xs text-aio-silver">
          Add another person — a second parent, guardian, or emergency contact — to receive appointment
          reminders and payment receipts by text and email. They won&apos;t get a portal login.
        </p>
      </div>

      {contacts.length > 0 ? (
        <div className="space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between border border-white/10 p-3 text-sm">
              <div>
                <p className="font-display font-bold">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-xs text-aio-silver">{[c.email, c.phone].filter(Boolean).join(" · ") || "—"}</p>
              </div>
              <form action={async () => removeHouseholdContactAction(householdId, c.id)}>
                <Button type="submit" size="sm" variant="ghost">
                  Remove
                </Button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-aio-silver">No additional contacts yet.</p>
      )}

      <form action={formAction} className="space-y-4 border-t border-white/10 pt-4">
        <input type="hidden" name="householdId" value={householdId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>First Name</label>
            <input name="firstName" required className={input} />
          </div>
          <div>
            <label className={label}>Last Name</label>
            <input name="lastName" required className={input} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" className={input} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input name="phone" type="tel" className={input} />
          </div>
        </div>
        {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-green-500">Contact added.</p> : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding..." : "Add Contact"}
        </Button>
      </form>
    </div>
  );
}
