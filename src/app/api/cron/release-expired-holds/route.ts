import { NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/booking";

function authorized(req: Request) {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const count = await releaseExpiredHolds();
  return NextResponse.json({ released: count });
}

export async function GET(req: Request) {
  return POST(req);
}
