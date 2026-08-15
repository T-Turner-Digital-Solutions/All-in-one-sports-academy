"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction, type AccountState } from "@/lib/actions/account";
import { Button } from "@/components/ui/Button";

const initialState: AccountState = {};

export function ProfileForm({ firstName, lastName, phone }: { firstName: string; lastName: string; phone: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="aio-card space-y-4 p-6">
      <p className="font-display text-lg font-bold">Profile</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>First Name</label>
          <input name="firstName" defaultValue={firstName} required className={input} />
        </div>
        <div>
          <label className={label}>Last Name</label>
          <input name="lastName" defaultValue={lastName} required className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Phone</label>
        <input name="phone" defaultValue={phone} className={input} />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Saved.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
  const input = "w-full border border-white/15 bg-aio-black px-3 py-2 text-sm outline-none focus:border-aio-red";
  const label = "mb-1 block text-xs uppercase tracking-wide text-aio-silver";

  return (
    <form action={formAction} className="aio-card space-y-4 p-6">
      <p className="font-display text-lg font-bold">Change Password</p>
      <div>
        <label className={label}>Current Password</label>
        <input name="currentPassword" type="password" required className={input} />
      </div>
      <div>
        <label className={label}>New Password</label>
        <input name="newPassword" type="password" minLength={8} required className={input} />
      </div>
      {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-green-500">Password updated.</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
