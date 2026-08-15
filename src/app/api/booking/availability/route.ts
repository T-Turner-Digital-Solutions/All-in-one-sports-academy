import { NextResponse } from "next/server";
import { getAvailableSlotsForCoachOnDate } from "@/lib/booking";

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

  const slots = await getAvailableSlotsForCoachOnDate(coachId, date);
  return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
}
