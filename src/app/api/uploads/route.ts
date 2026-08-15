import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Document/photo upload endpoint. In this environment there is no object
 * storage provider configured (BLOB_READ_WRITE_TOKEN is unset), so files are
 * written to /public/uploads for local development. For production, replace
 * this handler with an upload to durable object storage (e.g. Vercel Blob,
 * S3) — do not rely on local disk storage in a deployed/serverless
 * environment since it is not persistent.
 */

const MAX_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name).slice(0, 10);
  const safeName = `${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, safeName), bytes);

  return NextResponse.json({ url: `/uploads/${safeName}`, fileName: file.name });
}
