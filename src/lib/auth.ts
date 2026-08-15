import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // scopes which login surface this attempt came through, so e.g. a
        // client can't authenticate on the /admin-login form
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const portal = credentials?.portal as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: { coach: true },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        if (portal === "admin" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
          return null;
        }
        if (portal === "coach" && user.role !== "COACH") {
          return null;
        }
        if (portal === "client" && user.role !== "CLIENT") {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          coachId: user.coach?.id ?? null,
          householdId: user.householdId,
        };
      },
    }),
  ],
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
});
