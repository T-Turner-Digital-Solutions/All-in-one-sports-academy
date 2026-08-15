import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe NextAuth config shared between the full Node.js auth instance
 * (src/lib/auth.ts — used by the API route handler and server code, which
 * can touch Prisma/bcrypt) and the Edge Middleware auth instance
 * (src/lib/auth.edge.ts — used by src/proxy.ts).
 *
 * This file must never import Prisma, bcrypt, or anything else that pulls in
 * a native Node.js addon: Next.js Middleware runs in the Edge runtime, which
 * cannot load native binaries (e.g. Prisma's query engine). Session/JWT
 * callbacks here only shape token data already computed elsewhere — they
 * never query the database themselves, so they're safe for both runtimes.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      firstName: string;
      lastName: string;
      coachId?: string | null;
      householdId?: string | null;
    };
  }
  interface User {
    role: Role;
    firstName: string;
    lastName: string;
    coachId?: string | null;
    householdId?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    firstName: string;
    lastName: string;
    coachId?: string | null;
    householdId?: string | null;
    uid: string;
  }
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  // Netlify's Next.js runtime doesn't set the VERCEL env var Auth.js uses to
  // auto-trust the host, so without this every sign-in redirects to
  // /api/auth/error with a generic "server configuration" message.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id as string;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.coachId = user.coachId ?? null;
        token.householdId = user.householdId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.coachId = token.coachId;
      session.user.householdId = token.householdId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
