import { auth } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/appointments", label: "Sessions" },
  { href: "/book", label: "Book Training" },
  { href: "/dashboard/athletes", label: "Athletes" },
  { href: "/dashboard/packages", label: "Packages & Credits" },
  { href: "/dashboard/waivers", label: "Waivers" },
  { href: "/dashboard/receipts", label: "Receipts" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/settings", label: "Account Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <PortalShell title="Client Portal" navItems={NAV_ITEMS} userName={`${session?.user.firstName} ${session?.user.lastName}`}>
      {children}
    </PortalShell>
  );
}
