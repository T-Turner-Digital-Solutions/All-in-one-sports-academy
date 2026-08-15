import { NextResponse } from "next/server";
import { expireStaleWaitlistOffers } from "@/lib/waitlist";

function authorized(req: Request) {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const count = await expireStaleWaitlistOffers();
  return NextResponse.json({ expired: count });
}

export async function GET(req: Request) {
  return POST(req);
}
