import { Role } from "@prisma/client";

/**
 * Central role-based access control helpers. Every server route/action that
 * touches sensitive data must call one of these instead of trusting the
 * client (hidden navigation is never a security boundary).
 */

export type AppSession = {
  user: {
    id: string;
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    coachId?: string | null;
    householdId?: string | null;
  };
};

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function requireRole(session: AppSession | null, ...roles: Role[]): AppSession {
  if (!session) throw new UnauthorizedError();
  if (!roles.includes(session.user.role)) throw new ForbiddenError();
  return session;
}

export function isAdmin(role: Role) {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

export function isSuperAdmin(role: Role) {
  return role === Role.SUPER_ADMIN;
}

export function isCoach(role: Role) {
  return role === Role.COACH;
}

export function isClient(role: Role) {
  return role === Role.CLIENT;
}

/**
 * Coaches may never see org-wide financials, other coaches' earnings, admin
 * configuration, contractor applications, or other coaches' private records.
 * Admin dashboards must call requireRole(session, SUPER_ADMIN, ADMIN) before
 * returning organization financial data.
 */
export function assertCanViewOrgFinancials(session: AppSession | null) {
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
}

export function assertCanManageContractors(session: AppSession | null) {
  requireRole(session, Role.SUPER_ADMIN, Role.ADMIN);
}

export function assertOwnsCoachRecord(session: AppSession | null, coachId: string) {
  if (!session) throw new UnauthorizedError();
  if (isAdmin(session.user.role)) return;
  if (session.user.role === Role.COACH && session.user.coachId === coachId) return;
  throw new ForbiddenError();
}

export function assertOwnsHousehold(session: AppSession | null, householdId: string) {
  if (!session) throw new UnauthorizedError();
  if (isAdmin(session.user.role)) return;
  if (session.user.role === Role.CLIENT && session.user.householdId === householdId) return;
  throw new ForbiddenError();
}
