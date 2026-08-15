import { NextResponse } from "next/server";
import { getAvailableDatesForCoach, MIN_SESSION_HOURS, MAX_SESSION_HOURS, SESSION_LENGTH_MINUTES } from "@/lib/booking";

const MAX_DAYS = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coachId = searchParams.get("coachId");
  const startDateStr = searchParams.get("startDate");
  if (!coachId || !startDateStr) {
    return NextResponse.json({ error: "coachId and startDate are required" }, { status: 400 });
  }
  const startDate = new Date(`${startDateStr}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
  }

  const daysParam = Number(searchParams.get("days") ?? 14);
  const days = Number.isFinite(daysParam) ? Math.min(MAX_DAYS, Math.max(1, Math.round(daysParam))) : 14;

  const hoursParam = Number(searchParams.get("hours") ?? MIN_SESSION_HOURS);
  const hours = Number.isFinite(hoursParam)
    ? Math.min(MAX_SESSION_HOURS, Math.max(MIN_SESSION_HOURS, Math.round(hoursParam)))
    : MIN_SESSION_HOURS;

  const availableDates = await getAvailableDatesForCoach(coachId, startDate, days, hours * SESSION_LENGTH_MINUTES);
  return NextResponse.json({ availableDates });
}
