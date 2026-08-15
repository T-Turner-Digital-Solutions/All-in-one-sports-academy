import { NextResponse } from "next/server";
import { getQualifiedCoaches } from "@/lib/booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sportId = searchParams.get("sportId");
  if (!sportId) return NextResponse.json({ error: "sportId is required" }, { status: 400 });

  const coaches = await getQualifiedCoaches(sportId);
  return NextResponse.json({
    coaches: coaches.map((c) => ({
      id: c.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      bio: c.bio,
    })),
  });
}
