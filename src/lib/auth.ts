import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

/**
 * Full Node.js auth instance — used by the API route handler
 * (src/app/api/auth/[...nextauth]/route.ts) and everywhere in server
 * components/server actions that call auth(). This is the only file allowed
 * to import Prisma/bcrypt alongside NextAuth: it must NEVER be imported from
 * src/proxy.ts (Next.js Middleware runs on the Edge runtime, which cannot
 * load Prisma's native query engine binary). Middleware uses the separate
 * edge-safe instance in src/lib/auth.edge.ts instead.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
});
