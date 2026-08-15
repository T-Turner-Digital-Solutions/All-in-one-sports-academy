"use client";

import { useEffect, useMemo, useState } from "react";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

const DAYS_AHEAD = 14;

/**
 * Read-only "does anyone have an opening" calendar for pages that aren't
 * tied to a specific coach yet (e.g. Packages). X marks a date where no
 * active coach has any 1-hour opening at all.
 */
export function GeneralAvailabilityCalendar() {
  const today = useMemo(() => new Date(), []);
  const [availableDates, setAvailableDates] = useState<Set<string> | null>(null);

  useEffect(() => {
    const startDateIso = today.toISOString().slice(0, 10);
    fetch(`/api/booking/general-availability?startDate=${startDateIso}&days=${DAYS_AHEAD}`)
      .then((r) => r.json())
      .then((d) => setAvailableDates(new Set<string>(d.availableDates ?? [])));
  }, [today]);

  return (
    <div className="max-w-xs">
      <AvailabilityCalendar startDate={today} daysAhead={DAYS_AHEAD} availableDates={availableDates} />
      <p className="mt-2 text-xs text-aio-silver">
        <span className="text-aio-red/70">✕</span> = no coach openings that day — pick your exact time when you book.
      </p>
    </div>
  );
}
