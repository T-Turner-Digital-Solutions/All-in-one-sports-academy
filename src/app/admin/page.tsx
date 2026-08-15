import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const weekEnd = new Date(dayStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    todaysSessions,
    weekAppointments,
    revenueToday,
    revenueMonth,
    activeAthletes,
    activeCoaches,
    pendingApplications,
    recurringAthletes,
    waitlistCount,
    unsignedWaiversHouseholds,
    failedPayments,
    upcomingCamps,
  ] = await Promise.all([
    prisma.appointment.count({ where: { startsAt: { gte: dayStart, lt: dayEnd }, status: { in: ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] } } }),
    prisma.appointment.count({ where: { startsAt: { gte: dayStart, lt: weekEnd }, status: { in: ["SCHEDULED", "CONFIRMED"] } } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED", createdAt: { gte: dayStart, lt: dayEnd } }, _sum: { amountCents: true } }),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED", createdAt: { gte: monthStart } }, _sum: { amountCents: true } }),
    prisma.athlete.count({ where: { isActive: true } }),
    prisma.coach.count({ where: { status: "ACTIVE" } }),
    prisma.contractorApplication.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.recurringAppointment.count({ where: { status: "ACTIVE" } }),
    prisma.waitlistEntry.count(),
    prisma.athlete.count({ where: { isActive: true, waivers: { none: { type: "PARTICIPATION" } } } }),
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.camp.count({ where: { isPublished: true, startsAt: { gte: now } } }),
  ]);

  const cards = [
    { label: "Today's Sessions", value: todaysSessions, href: "/admin/appointments" },
    { label: "Appointments This Week", value: weekAppointments, href: "/admin/appointments" },
    { label: "Revenue Today", value: formatCents(revenueToday._sum.amountCents ?? 0), href: "/admin/payments" },
    { label: "Revenue This Month", value: formatCents(revenueMonth._sum.amountCents ?? 0), href: "/admin/reports" },
    { label: "Active Athletes", value: activeAthletes, href: "/admin/athletes" },
    { label: "Active Coaches", value: activeCoaches, href: "/admin/coaches" },
    { label: "Pending Contractor Applications", value: pendingApplications, href: "/admin/contractor-applications", alert: pendingApplications > 0 },
    { label: "Recurring Athletes", value: recurringAthletes, href: "/admin/recurring-training" },
    { label: "Waitlist Count", value: waitlistCount, href: "/admin/waitlist" },
    { label: "Unsigned Waivers", value: unsignedWaiversHouseholds, href: "/admin/waivers", alert: unsignedWaiversHouseholds > 0 },
    { label: "Failed Payments", value: failedPayments, href: "/admin/payments", alert: failedPayments > 0 },
    { label: "Upcoming Camps", value: upcomingCamps, href: "/admin/camps" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="aio-card p-5">
            <p className={`font-display text-3xl font-bold ${c.alert ? "text-aio-red" : "text-aio-white"}`}>{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-aio-silver">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
