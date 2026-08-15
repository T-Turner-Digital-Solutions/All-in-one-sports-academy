"use client";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_MS = 86_400_000;

/**
 * Calendar grid (Sun-Sat columns) covering [startDate, startDate + daysAhead).
 * Dates outside that bookable range are shown greyed out and disabled. Dates
 * inside the range with no availability get an X and are disabled too —
 * `availableDates === null` means "still loading" and every in-range date is
 * shown as plain/clickable until the real data arrives.
 */
export function AvailabilityCalendar({
  startDate,
  daysAhead,
  availableDates,
  selectedDate,
  onSelect,
}: {
  startDate: Date;
  daysAhead: number;
  availableDates: Set<string> | null;
  selectedDate?: string | null;
  onSelect?: (iso: string) => void;
}) {
  const today = new Date(startDate);
  today.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(today);
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead - 1);

  const gridStart = new Date(today);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  const totalCells = Math.ceil((Math.round((rangeEnd.getTime() - gridStart.getTime()) / DAY_MS) + 1) / 7) * 7;
  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-aio-silver">
        {WEEKDAY_LABELS.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const inRange = d >= today && d <= rangeEnd;
          const isAvailable = availableDates?.has(iso) ?? false;
          const isUnavailable = inRange && availableDates !== null && !isAvailable;
          const isSelected = selectedDate === iso;
          const clickable = Boolean(inRange && onSelect && !isUnavailable);

          return (
            <button
              key={iso}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect?.(iso)}
              className={`relative flex aspect-square flex-col items-center justify-center border text-xs transition-colors ${
                !inRange
                  ? "border-white/5 text-aio-silver/20"
                  : isSelected
                    ? "border-aio-red bg-aio-red/10 text-aio-red"
                    : isUnavailable
                      ? "border-white/10 text-aio-silver/30"
                      : "border-white/15 text-aio-white hover:border-aio-red/60"
              }`}
            >
              <span>{d.getDate()}</span>
              {isUnavailable ? <span className="absolute inset-0 flex items-center justify-center text-aio-red/70">✕</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
