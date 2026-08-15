"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_MS = 86_400_000;
// Current month + this many more = 3 months of browsable range.
const MAX_MONTHS_AHEAD = 2;

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/**
 * Read-only "does anyone have an opening" month calendar for pages that
 * aren't tied to a specific coach yet (e.g. Packages). Browsable up to
 * MAX_MONTHS_AHEAD months forward. X marks any date with no active coach
 * opening at all — including already-passed days, since the underlying
 * availability query naturally excludes past times.
 */
export function GeneralAvailabilityCalendar() {
  const todayMonth = useMemo(() => startOfMonth(new Date()), []);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [monthOffset, setMonthOffset] = useState(0);
  const [availableDates, setAvailableDates] = useState<Set<string> | null>(null);

  const viewedMonth = useMemo(() => addMonths(todayMonth, monthOffset), [todayMonth, monthOffset]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- previous month's data shouldn't briefly apply to the new one
    setAvailableDates(null);
    const startDateIso = viewedMonth.toISOString().slice(0, 10);
    const days = daysInMonth(viewedMonth);
    fetch(`/api/booking/general-availability?startDate=${startDateIso}&days=${days}`)
      .then((r) => r.json())
      .then((d) => setAvailableDates(new Set<string>(d.availableDates ?? [])));
  }, [viewedMonth]);

  const gridStart = new Date(viewedMonth);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const lastOfMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0);
  const totalCells = Math.ceil((Math.round((lastOfMonth.getTime() - gridStart.getTime()) / DAY_MS) + 1) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="max-w-xs">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          aria-label="Previous month"
          className="border border-white/15 p-1 text-aio-silver transition-colors hover:border-aio-red hover:text-aio-red disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="font-display text-sm font-bold uppercase tracking-wide">
          {viewedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(MAX_MONTHS_AHEAD, o + 1))}
          disabled={monthOffset === MAX_MONTHS_AHEAD}
          aria-label="Next month"
          className="border border-white/15 p-1 text-aio-silver transition-colors hover:border-aio-red hover:text-aio-red disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-aio-silver">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const inMonth = d.getMonth() === viewedMonth.getMonth();
          const isPast = d < today;
          const isAvailable = availableDates?.has(iso) ?? false;
          const isUnavailable = inMonth && (isPast || (availableDates !== null && !isAvailable));

          return (
            <div
              key={iso}
              className={`relative flex aspect-square flex-col items-center justify-center border text-xs ${
                !inMonth
                  ? "border-transparent text-transparent"
                  : isUnavailable
                    ? "border-white/10 text-aio-silver/30"
                    : "border-white/15 text-aio-white"
              }`}
            >
              {inMonth ? <span>{d.getDate()}</span> : null}
              {isUnavailable ? <span className="absolute inset-0 flex items-center justify-center text-aio-red/70">✕</span> : null}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-aio-silver">
        <span className="text-aio-red/70">✕</span> = already passed or no coach openings that day — pick your exact time when you book.
      </p>
    </div>
  );
}
