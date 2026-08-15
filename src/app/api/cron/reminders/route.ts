import { NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

function authorized(req: Request) {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await sendDueReminders();
  return NextResponse.json(result);
}

export async function GET(req: Request) {
  return POST(req);
}
