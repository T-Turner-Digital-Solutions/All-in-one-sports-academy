import { auth } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/parents", label: "Parents" },
  { href: "/admin/athletes", label: "Athletes" },
  { href: "/admin/coaches", label: "Coaches" },
  { href: "/admin/contractor-applications", label: "Contractor Applications" },
  { href: "/admin/recurring-training", label: "Recurring Training" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/coach-payouts", label: "Coach Payouts" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/sports", label: "Sports" },
  { href: "/admin/camps", label: "Camps & Clinics" },
  { href: "/admin/promo-codes", label: "Promo Codes" },
  { href: "/admin/gift-certificates", label: "Gift Certificates" },
  { href: "/admin/waivers", label: "Waivers" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/website-content", label: "Website Content" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit-log", label: "Audit Log" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <PortalShell title="Admin Portal" navItems={NAV_ITEMS} userName={`${session?.user.firstName} ${session?.user.lastName} · ${session?.user.role}`}>
      {children}
    </PortalShell>
  );
}
