import { auth } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

const NAV_ITEMS = [
  { href: "/coach", label: "Dashboard" },
  { href: "/coach/schedule", label: "Schedule" },
  { href: "/coach/athletes", label: "Athletes" },
  { href: "/coach/availability", label: "Availability" },
  { href: "/coach/recurring", label: "Recurring Clients" },
  { href: "/coach/documents", label: "Documents" },
  { href: "/coach/earnings", label: "Earnings" },
  { href: "/coach/messages", label: "Messages" },
  { href: "/coach/settings", label: "Profile & Settings" },
];

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <PortalShell title="Coach Portal" navItems={NAV_ITEMS} userName={`${session?.user.firstName} ${session?.user.lastName}`}>
      {children}
    </PortalShell>
  );
}
