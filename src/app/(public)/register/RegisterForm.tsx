"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerClientAction, type RegisterState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerClientAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/login?portal=client&registered=1"), 1200);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold">Account Created</h1>
        <p className="mt-3 text-aio-silver">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">Create an Account</p>
      <h1 className="mt-2 text-3xl font-bold">Join All In One Sports Academy</h1>
      <p className="mt-3 text-sm text-aio-silver">
        Your account manages your household — add every athlete you train after signing up.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">First Name</label>
            <input name="firstName" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
            {state.fieldErrors?.firstName ? <p className="mt-1 text-xs text-aio-red">{state.fieldErrors.firstName}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Last Name</label>
            <input name="lastName" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
            {state.fieldErrors?.lastName ? <p className="mt-1 text-xs text-aio-red">{state.fieldErrors.lastName}</p> : null}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Email</label>
          <input name="email" type="email" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
          {state.fieldErrors?.email ? <p className="mt-1 text-xs text-aio-red">{state.fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Phone</label>
          <input name="phone" type="tel" required className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
          {state.fieldErrors?.phone ? <p className="mt-1 text-xs text-aio-red">{state.fieldErrors.phone}</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Password</label>
          <input name="password" type="password" required minLength={8} className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 outline-none focus:border-aio-red" />
          {state.fieldErrors?.password ? <p className="mt-1 text-xs text-aio-red">{state.fieldErrors.password}</p> : null}
        </div>
        {state.error ? <p className="text-sm text-aio-red">{state.error}</p> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
