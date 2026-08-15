import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * Edge-runtime auth instance used ONLY by src/proxy.ts (Next.js Middleware).
 * Built from authConfig alone — no Credentials provider, so nothing here
 * imports Prisma or bcrypt. This can still verify/decode the session JWT
 * (that only needs the shared secret), which is all route-gating in
 * middleware requires. Never import this file from server components,
 * server actions, or API routes — use src/lib/auth.ts there instead, which
 * has the full provider set for real sign-in.
 */
export const { auth } = NextAuth(authConfig);
