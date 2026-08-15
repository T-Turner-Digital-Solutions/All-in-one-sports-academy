"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

const PORTAL_LABEL: Record<string, string> = {
  client: "Client Login",
  coach: "Coach Login",
  admin: "Admin Login",
};

const PORTAL_REDIRECT: Record<string, string> = {
  client: "/dashboard",
  coach: "/coach",
  admin: "/admin",
};

export function LoginForm({ portal }: { portal: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(
    params.get("error") === "forbidden" ? "That account doesn't have access to this portal." : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      portal,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password for this portal.");
      return;
    }
    const callbackUrl = params.get("callbackUrl");
    router.push(callbackUrl || PORTAL_REDIRECT[portal] || "/");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="font-display text-xs font-semibold tracking-[0.3em] text-aio-red">
        {PORTAL_LABEL[portal] ?? "Login"}
      </p>
      <h1 className="mt-2 text-3xl font-bold">Welcome Back</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 text-aio-white outline-none focus:border-aio-red"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-aio-silver">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full border border-white/15 bg-aio-charcoal px-4 py-3 text-aio-white outline-none focus:border-aio-red"
          />
        </div>
        {error ? <p className="text-sm text-aio-red">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      {portal === "client" ? (
        <p className="mt-6 text-sm text-aio-silver">
          New to All In One Sports Academy?{" "}
          <a href="/register" className="text-aio-red hover:underline">
            Create an account
          </a>
        </p>
      ) : null}
      {portal === "coach" ? (
        <p className="mt-6 text-sm text-aio-silver">
          Want to coach with us?{" "}
          <a href="/apply-to-coach" className="text-aio-red hover:underline">
            Apply to join the team
          </a>
        </p>
      ) : null}
    </div>
  );
}
