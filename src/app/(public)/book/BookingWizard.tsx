"use client";

import { useEffect, useMemo, useState, useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { createHoldAction, completeCheckoutAction, type HoldState, type CheckoutState } from "@/lib/actions/booking";
import { joinWaitlistAction, type JoinWaitlistState } from "@/lib/actions/waitlist";
import { formatCents, formatDate, formatDateTime, calculateAge } from "@/lib/format";
import { POLICY_ACCEPTANCE_TEXT } from "@/lib/policy";

type Sport = { id: string; name: string; slug: string };
type Program = { id: string; name: string; sportId: string | null };
type Athlete = { id: string; firstName: string; lastName: string; dob: string };
type Coach = { id: string; firstName: string; lastName: string; bio: string | null };

const STEPS = ["Athlete", "Sport", "Training Type", "Coach", "Date & Time", "Review", "Payment", "Confirmed"];

const HOUR_OPTIONS = [1, 2, 3, 4];

export function BookingWizard({
  sports,
  trainingPrograms,
  athletes,
  loggedIn,
  pricePerHourCents,
  isStripeConfigured,
  initialSportId,
  initialCoachId,
}: {
  sports: Sport[];
  trainingPrograms: Program[];
  athletes: Athlete[];
  loggedIn: boolean;
  pricePerHourCents: number;
  isStripeConfigured: boolean;
  initialSportId?: string;
  initialCoachId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [athleteId, setAthleteId] = useState<string | null>(athletes[0]?.id ?? null);
  const [sportId, setSportId] = useState<string | null>(initialSportId ?? null);
  const [trainingProgramId, setTrainingProgramId] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(initialCoachId ?? null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [hours, setHours] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<string[] | null>(null);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);

  const priceCents = pricePerHourCents * hours;

  const [holdState, holdAction, holdPending] = useActionState<HoldState, FormData>(createHoldAction, {});
  const [checkoutState, checkoutAction, checkoutPending] = useActionState<CheckoutState, FormData>(
    completeCheckoutAction,
    {}
  );
  const [waitlistState, waitlistAction] = useActionState<JoinWaitlistState, FormData>(joinWaitlistAction, {});
  const [, startTransition] = useTransition();

  const athlete = athletes.find((a) => a.id === athleteId) ?? null;
  const sport = sports.find((s) => s.id === sportId) ?? null;
  const coach = coaches.find((c) => c.id === coachId) ?? null;
  const relevantPrograms = trainingPrograms.filter((p) => !p.sportId || p.sportId === sportId);

  useEffect(() => {
    if (!sportId) return;
    fetch(`/api/booking/coaches?sportId=${sportId}`)
      .then((r) => r.json())
      .then((d) => setCoaches(d.coaches ?? []));
  }, [sportId]);

  useEffect(() => {
    if (!coachId || !selectedDate) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-change loading flag
    setLoadingSlots(true);
    setStartsAt(null); // a previously-picked time may no longer fit the new duration
    fetch(`/api/booking/availability?coachId=${coachId}&date=${selectedDate}&hours=${hours}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [coachId, selectedDate, hours]);

  // Hold created — advance to payment step and start countdown.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local wizard step to server-action result
    if (holdState.appointmentId) setStep(6);
  }, [holdState.appointmentId]);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!holdState.holdExpiresAt) return;
    const expires = new Date(holdState.holdExpiresAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.round((expires - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdState.holdExpiresAt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs local wizard step to server-action result
    if (checkoutState.success) setStep(7);
  }, [checkoutState.success]);

  const next14Days = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-display text-2xl font-bold">Log In to Book Training</p>
        <p className="mt-3 text-aio-silver">
          Booking is tied to your household so we can track athlete profiles, waivers, and session
          history in one place.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push("/login?portal=client&callbackUrl=/book")}>
            Log In
          </Button>
          <Button variant="outline" onClick={() => router.push("/register")}>
            Create an Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-10 hidden flex-wrap gap-2 sm:flex">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`border px-3 py-1 text-xs font-display uppercase tracking-wide ${
              i === step ? "border-aio-red text-aio-red" : "border-white/15 text-aio-silver"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <StepBlock title="Select Athlete">
          {athletes.length === 0 ? (
            <p className="text-aio-silver">
              You don&apos;t have any athlete profiles yet. Add one from your{" "}
              <Link href="/dashboard/athletes" className="text-aio-red hover:underline">
                client dashboard
              </Link>{" "}
              before booking.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {athletes.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAthleteId(a.id)}
                  className={`aio-card p-4 text-left ${athleteId === a.id ? "border-aio-red" : ""}`}
                >
                  <p className="font-display font-bold">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-xs text-aio-silver">Age {calculateAge(a.dob)}</p>
                </button>
              ))}
            </div>
          )}
          <WizardNav onNext={() => setStep(1)} nextDisabled={!athleteId} />
        </StepBlock>
      ) : null}

      {step === 1 ? (
        <StepBlock title="Select Sport">
          <div className="grid gap-3 sm:grid-cols-3">
            {sports.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSportId(s.id);
                  setCoachId(null);
                }}
                className={`aio-card p-4 text-left ${sportId === s.id ? "border-aio-red" : ""}`}
              >
                <p className="font-display font-bold">{s.name}</p>
              </button>
            ))}
          </div>
          <WizardNav onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!sportId} />
        </StepBlock>
      ) : null}

      {step === 2 ? (
        <StepBlock title="Select Training Type">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setTrainingProgramId(null)}
              className={`aio-card p-4 text-left ${trainingProgramId === null ? "border-aio-red" : ""}`}
            >
              <p className="font-display font-bold">General Private Training</p>
            </button>
            {relevantPrograms.map((p) => (
              <button
                key={p.id}
                onClick={() => setTrainingProgramId(p.id)}
                className={`aio-card p-4 text-left ${trainingProgramId === p.id ? "border-aio-red" : ""}`}
              >
                <p className="font-display font-bold">{p.name}</p>
              </button>
            ))}
          </div>
          <WizardNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </StepBlock>
      ) : null}

      {step === 3 ? (
        <StepBlock title="Select Coach">
          {coaches.length === 0 ? (
            <p className="text-aio-silver">Loading qualified coaches...</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {coaches.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCoachId(c.id)}
                  className={`aio-card p-4 text-left ${coachId === c.id ? "border-aio-red" : ""}`}
                >
                  <p className="font-display font-bold">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="line-clamp-2 text-xs text-aio-silver">{c.bio}</p>
                </button>
              ))}
            </div>
          )}
          <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!coachId} />
        </StepBlock>
      ) : null}

      {step === 4 ? (
        <StepBlock title="Select Date & Time">
          <div className="mb-6">
            <p className="mb-2 text-xs uppercase tracking-wide text-aio-silver">
              Session Length — {formatCents(pricePerHourCents)}/hr
            </p>
            <div className="flex gap-2">
              {HOUR_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => setHours(h)}
                  className={`border px-4 py-2 text-sm font-display ${
                    hours === h ? "border-aio-red bg-aio-red/10 text-aio-red" : "border-white/15"
                  }`}
                >
                  {h} hr{h > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {next14Days.map((d) => {
              const iso = d.toISOString().slice(0, 10);
              return (
                <button
                  key={iso}
                  onClick={() => {
                    setSelectedDate(iso);
                    setStartsAt(null);
                  }}
                  className={`shrink-0 border px-3 py-2 text-xs font-display uppercase ${
                    selectedDate === iso ? "border-aio-red text-aio-red" : "border-white/15 text-aio-silver"
                  }`}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            {loadingSlots ? (
              <p className="text-aio-silver">Checking availability...</p>
            ) : slots && slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStartsAt(s)}
                    className={`border px-3 py-2 text-sm ${
                      startsAt === s ? "border-aio-red bg-aio-red/10 text-aio-red" : "border-white/15"
                    }`}
                  >
                    {new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            ) : (
              <div className="aio-card p-6">
                <p className="font-display font-bold text-aio-red">
                  {coach?.firstName} {coach?.lastName} — Unavailable
                </p>
                <p className="mt-2 text-sm text-aio-silver">
                  No openings on this date. Pick another date, choose another coach, or join the
                  waitlist below.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                    Choose Another Coach
                  </Button>
                </div>
                <form action={waitlistAction} className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <p className="font-display text-sm font-bold">Join {coach?.firstName}&apos;s Waitlist</p>
                  <input type="hidden" name="athleteId" value={athleteId ?? ""} />
                  <input type="hidden" name="sportId" value={sportId ?? ""} />
                  <input type="hidden" name="coachId" value={coachId ?? ""} />
                  <input type="hidden" name="desiredDate" value={selectedDate} />
                  <label className="flex items-center gap-2 text-xs text-aio-silver">
                    <input type="checkbox" name="flexible" value="true" /> I&apos;m flexible on date/time
                  </label>
                  {waitlistState.success ? (
                    <p className="text-sm text-green-500">You&apos;re on the waitlist. We&apos;ll email you the moment a slot opens.</p>
                  ) : (
                    <Button type="submit" size="sm" variant="outline">
                      Join Waitlist
                    </Button>
                  )}
                </form>
              </div>
            )}
          </div>
          <WizardNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!startsAt} />
        </StepBlock>
      ) : null}

      {step === 5 ? (
        <StepBlock title="Review Your Booking">
          <div className="aio-card space-y-3 p-6 text-sm">
            <Row label="Athlete" value={athlete ? `${athlete.firstName} ${athlete.lastName}` : "—"} />
            <Row label="Sport" value={sport?.name ?? "—"} />
            <Row
              label="Training Type"
              value={relevantPrograms.find((p) => p.id === trainingProgramId)?.name ?? "General Private Training"}
            />
            <Row label="Coach" value={coach ? `${coach.firstName} ${coach.lastName}` : "—"} />
            <Row label="Date & Time" value={startsAt ? formatDateTime(startsAt) : "—"} />
            <Row label="Duration" value={`${hours} hour${hours > 1 ? "s" : ""}`} />
            <Row label="Price" value={`${formatCents(priceCents)} (${formatCents(pricePerHourCents)}/hr)`} />
          </div>
          {holdState.error ? <p className="mt-4 text-sm text-aio-red">{holdState.error}</p> : null}
          <form
            action={(fd) => {
              fd.set("athleteId", athleteId ?? "");
              fd.set("sportId", sportId ?? "");
              if (trainingProgramId) fd.set("trainingProgramId", trainingProgramId);
              fd.set("coachId", coachId ?? "");
              fd.set("startsAt", startsAt ?? "");
              fd.set("hours", String(hours));
              startTransition(() => holdAction(fd));
            }}
          >
            <WizardNav onBack={() => setStep(4)} nextLabel={holdPending ? "Holding Slot..." : "Continue to Payment"} nextType="submit" nextDisabled={holdPending} />
          </form>
        </StepBlock>
      ) : null}

      {step === 6 && holdState.appointmentId ? (
        <StepBlock title="Agree & Pay">
          {secondsLeft !== null ? (
            <p className="mb-4 text-sm text-aio-silver">
              Your slot is held for{" "}
              <span className="font-display font-bold text-aio-red">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
              . Complete checkout before it expires.
            </p>
          ) : null}

          <label className="flex items-start gap-3 text-sm text-aio-silver-light">
            <input
              type="checkbox"
              checked={policyAgreed}
              onChange={(e) => setPolicyAgreed(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            {POLICY_ACCEPTANCE_TEXT}
          </label>

          {!isStripeConfigured ? (
            <p className="mt-4 border border-aio-silver/30 bg-aio-charcoal p-3 text-xs text-aio-silver">
              Stripe is not configured in this environment. This is a development payment confirmation
              so the booking pipeline can be fully exercised — no card will be charged.
            </p>
          ) : null}

          {checkoutState.error ? <p className="mt-4 text-sm text-aio-red">{checkoutState.error}</p> : null}

          <form
            action={(fd) => {
              fd.set("appointmentId", holdState.appointmentId ?? "");
              fd.set("policyAgreement", policyAgreed ? "true" : "false");
              startTransition(() => checkoutAction(fd));
            }}
            className="mt-6"
          >
            <Button type="submit" size="lg" disabled={!policyAgreed || checkoutPending}>
              {checkoutPending ? "Processing..." : `Pay ${formatCents(priceCents)} & Confirm Booking`}
            </Button>
          </form>
        </StepBlock>
      ) : null}

      {step === 7 ? (
        <StepBlock title="Booking Confirmed">
          <div className="aio-card p-8 text-center">
            <p className="font-display text-2xl font-bold text-aio-red">You&apos;re All Set!</p>
            <p className="mt-3 text-aio-silver">
              {athlete?.firstName}&apos;s {sport?.name} session with {coach?.firstName} {coach?.lastName} on{" "}
              {startsAt ? formatDate(startsAt) : ""} is confirmed. A confirmation email is on its way.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </div>
          </div>
        </StepBlock>
      ) : null}
    </div>
  );
}

function StepBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-2">
      <span className="text-aio-silver">{label}</span>
      <span className="font-display font-semibold">{value}</span>
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Continue",
  nextType = "button",
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextType?: "button" | "submit";
}) {
  return (
    <div className="mt-8 flex justify-between">
      {onBack ? (
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button type={nextType} onClick={nextType === "button" ? onNext : undefined} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}
