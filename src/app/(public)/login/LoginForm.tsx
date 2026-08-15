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

// Publicly documented demo account (see prisma/seed.ts) so visitors can
// explore the client portal without creating a real account.
const DEMO_CLIENT_EMAIL = "tabithathompson2517@gmail.com";
const DEMO_CLIENT_PASSWORD = "ChangeMe123!";

export function LoginForm({ portal }: { portal: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(
    params.get("error") === "forbidden" ? "That account doesn't have access to this portal." : null
  );
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

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

  async function onDemoLogin() {
    setDemoLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email: DEMO_CLIENT_EMAIL,
      password: DEMO_CLIENT_PASSWORD,
      portal: "client",
      redirect: false,
    });
    setDemoLoading(false);
    if (res?.error) {
      setError("The demo account is temporarily unavailable. Please try again shortly.");
      return;
    }
    router.push("/dashboard");
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
        <div className="mt-6 space-y-4">
          <p className="text-sm text-aio-silver">
            New to All In One Sports Academy?{" "}
            <a href="/register" className="text-aio-red hover:underline">
              Create an account
            </a>
          </p>
          <Button type="button" variant="outline" className="w-full" onClick={onDemoLogin} disabled={demoLoading}>
            {demoLoading ? "Loading Demo..." : "View Demo"}
          </Button>
          <p className="text-xs text-aio-silver/70">
            Explore the client portal instantly with a demo account — no sign-up required.
          </p>
        </div>
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
