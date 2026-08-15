# All In One Sports Academy

**One Academy. Every Sport. Endless Possibilities.**

A production-grade sports academy management platform for All In One Sports Academy
(owned by Justin Woodall) — a public marketing site plus a full booking, payments,
waitlist, coaching, and administration system. Built to run with Justin as the only
coach on day one and scale into a multi-coach, multi-sport, multi-location
organization without a rebuild.

## Tech Stack

- **Next.js 16** (App Router, Turbopack, Server Actions) + React 19 + TypeScript
- **PostgreSQL** via **Prisma 5** — see `prisma/schema.prisma` for the full data model
- **Auth.js / NextAuth v5** (credentials + JWT sessions) with role-based access control
  enforced in `src/proxy.ts` (Next's renamed middleware) *and* inside every server
  action/API route — navigation is never the only security boundary
- **Stripe** for payments (architecture wired; falls back to a clearly-labeled dev
  payment path when no API key is configured)
- **Resend** for email, with an SMS abstraction ready for **Twilio**
- Tailwind CSS v4 with a custom black/red/white/metallic-silver brand system

## Getting Started

```bash
npm install
cp .env.example .env   # or edit .env directly — see below
npx prisma migrate dev
npm run db:seed
npm run dev
```

Visit http://localhost:3000.

### Seeded logins (password `ChangeMe123!` for all — change immediately)

| Role | Email |
|---|---|
| Super Admin / Owner (Justin) | `justin@allinonesportsacademy.com` |
| Demo Coach | `coach.demo@allinonesportsacademy.com` |
| Demo Client | `tabithathompson2517@gmail.com` |

Seed data includes: one location, nine initial sports, training programs, the
confirmed $80 single-session package, Justin as Super Admin + Coach with weekly
availability, a second demo coach, and a demo household with one athlete.

## What's Fully Wired vs. What Needs Configuration

This is a real, working system end-to-end — booking, holds, conflict prevention,
waitlist sequencing, RBAC, contractor approval, coach payouts, etc. all function
against the database today. Three integrations require credentials that aren't
available in this environment:

| Integration | Status | To enable |
|---|---|---|
| **Stripe payments** | Architecture complete (`src/lib/stripe.ts`, PaymentIntent creation, webhook handler at `/api/webhooks/stripe`). Falls back to an explicitly-labeled dev-mode payment confirmation so the full booking pipeline can be exercised without live card processing. | Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Add Stripe Elements to the checkout step in `BookingWizard.tsx` once configured. |
| **Resend email** | Every notification is recorded in the `Notification` table regardless of configuration (`status: SKIPPED_NOT_CONFIGURED` when no key is set), visible in Admin → Notifications. | Set `RESEND_API_KEY` and `EMAIL_FROM`. |
| **Twilio SMS** | Same logging behavior; `sendSms()` in `src/lib/notifications.ts` posts to the Twilio REST API directly (no SDK dependency needed). | Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. |
| **File uploads** (contractor documents, profile photos) | Functional locally via `/api/uploads`, which writes to `public/uploads`. **Not durable on serverless/production deploys.** | Swap the handler for a real object-storage provider (Vercel Blob, S3, etc.) before going live. |

## Scheduled Jobs (Cron)

Three endpoints must be called on a schedule (e.g. Vercel Cron, GitHub Actions, or
any external scheduler) and are protected by a bearer token:

```
Authorization: Bearer $CRON_SECRET
```

| Endpoint | Suggested cadence | Purpose |
|---|---|---|
| `POST /api/cron/release-expired-holds` | every 1–2 min | Releases `HELD` appointments whose checkout window expired without payment |
| `POST /api/cron/waitlist-expiry` | every 1 min | Expires 15-minute waitlist offers and advances to the next person in queue |
| `POST /api/cron/reminders` | hourly | Sends the 72h reschedule-window notice, 24h/2h reminders, and post-session follow-ups |

## Architecture Highlights

- **Booking reliability & conflict prevention** (`src/lib/booking.ts`): a database
  unique constraint on `Appointment(coachId, startsAt)` is the actual source of
  truth for "no double booking" — not application-level checks, which can race.
  Concurrent requests for the same slot: one wins, one gets a friendly "slot no
  longer available" error.
- **Waitlist engine** (`src/lib/waitlist.ts`): ordered queue per sport/coach/date,
  offers a freed slot to the next person for exactly 15 minutes via a temporary
  `HELD` appointment, and cascades to the next person on decline/expiry.
- **Reschedule & cancellation policy** (`src/lib/policy.ts`, `src/lib/appointments.ts`):
  single source of truth for the 72-hour rule and policy text; admin override is
  available per-appointment; org/coach-initiated cancellations automatically
  convert the payment to a transferable credit.
- **RBAC** (`src/lib/rbac.ts`, `src/proxy.ts`): Super Admin / Admin / Coach / Client
  / Public. Coaches can only see their own athletes, sessions, and earnings —
  organization financials, other coaches' data, and contractor applications are
  admin-only and enforced server-side, not just hidden from navigation.
- **Contractor approval workflow**: applicants create an account and submit an
  application (`/apply-to-coach`) but gain **no** coach/client data access until an
  admin approves them — approval is the only path that provisions a `Coach` record
  and elevates the user's role.
- **Coach compensation & payouts**: per-coach flat/percentage/hourly/custom rules,
  computed automatically on each successful payment (`src/lib/payments.ts`), with
  an admin-triggered payout action that marks earnings paid.
- **Audit log**: critical admin actions (contractor approvals, coach reassignment,
  price/compensation changes, recurring-appointment edits, setting changes) are
  recorded with before/after values in `AuditLog`.

## Data Model

See `prisma/schema.prisma` for the complete, indexed, foreign-keyed schema —
users/roles, households/athletes, coaches/contractor applications/documents,
sports/programs (fully admin-manageable, never hard-coded), locations, appointments
+ recurring appointments, payments + policy acceptances, packages/package balances,
waitlists/entries/offers, notifications, waivers, evaluations/progress metrics,
session notes, attendance, coach compensation/earnings/payouts, camps/registrations,
promo codes/gift certificates, reviews, audit logs, and settings.

## Project Structure

```
prisma/schema.prisma        Full data model
prisma/seed.ts               Seed script (sports, location, owner, demo data)
src/lib/                     Business logic: booking, waitlist, payments, rbac, etc.
src/lib/actions/             Server Actions used by client components
src/app/(public)/            Public marketing site + booking wizard + auth pages
src/app/dashboard/           Client/parent portal
src/app/coach/               Coach portal (scoped to the logged-in coach)
src/app/admin/               Admin/owner portal (Super Admin + Admin roles)
src/app/api/                 Route handlers: NextAuth, booking APIs, webhooks, cron
src/proxy.ts                 Route-group auth gating (Next's renamed middleware)
```

## Deployment Notes

- Requires a PostgreSQL database (`DATABASE_URL`) and a persistent-process or
  serverless host that supports Next.js Server Actions and Route Handlers.
- Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (or `AUTH_SECRET`/`AUTH_URL`) to real
  values in production — the `.env` defaults are development-only placeholders.
- Wire the three integrations above before accepting real payments or sending
  real client communications.
- Run `prisma migrate deploy` (not `migrate dev`) in production.
