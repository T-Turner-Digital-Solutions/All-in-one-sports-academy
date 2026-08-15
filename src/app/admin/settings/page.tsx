import { getSinglSessionPriceCents } from "@/lib/booking";
import { RESCHEDULE_WINDOW_HOURS, CURRENT_POLICY_VERSION } from "@/lib/policy";
import { WAITLIST_OFFER_MINUTES } from "@/lib/waitlist";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const priceCents = await getSinglSessionPriceCents();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-xs text-aio-silver">Super Admin only.</p>
      </div>

      <SettingsForm singleSessionPriceCents={priceCents} />

      <div className="aio-card p-6 text-sm text-aio-silver">
        <p className="font-display font-bold text-aio-white">Fixed Business Rules</p>
        <p className="mt-2">Reschedule window: {RESCHEDULE_WINDOW_HOURS} hours before an appointment (admin override available per-appointment).</p>
        <p className="mt-1">Waitlist offer window: {WAITLIST_OFFER_MINUTES} minutes per offer.</p>
        <p className="mt-1">Current policy version: {CURRENT_POLICY_VERSION}</p>
      </div>
    </div>
  );
}
