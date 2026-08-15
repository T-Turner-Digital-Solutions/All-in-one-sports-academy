import { NextResponse } from "next/server";
import { getAvailableDatesAcrossAcademy } from "@/lib/booking";

const MAX_DAYS = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate");
  const startDate = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date(new Date().toISOString().slice(0, 10) + "T00:00:00");
  if (Number.isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
  }

  const daysParam = Number(searchParams.get("days") ?? 14);
  const days = Number.isFinite(daysParam) ? Math.min(MAX_DAYS, Math.max(1, Math.round(daysParam))) : 14;

  const availableDates = await getAvailableDatesAcrossAcademy(startDate, days);
  return NextResponse.json({ availableDates });
}
