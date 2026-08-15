import { NextResponse } from "next/server";
import { getAvailableSlotsForCoachOnDate, MIN_SESSION_HOURS, MAX_SESSION_HOURS, SESSION_LENGTH_MINUTES } from "@/lib/booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  if (!coachId || !dateStr) {
    return NextResponse.json({ error: "coachId and date are required" }, { status: 400 });
  }
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const hoursParam = Number(searchParams.get("hours") ?? MIN_SESSION_HOURS);
  const hours = Number.isFinite(hoursParam)
    ? Math.min(MAX_SESSION_HOURS, Math.max(MIN_SESSION_HOURS, Math.round(hoursParam)))
    : MIN_SESSION_HOURS;

  const slots = await getAvailableSlotsForCoachOnDate(coachId, date, hours * SESSION_LENGTH_MINUTES);
  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}
