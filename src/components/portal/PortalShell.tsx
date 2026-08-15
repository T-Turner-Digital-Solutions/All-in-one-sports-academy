"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export type NavItem = { href: string; label: string };

export function PortalShell({
  title,
  navItems,
  userName,
  children,
}: {
  title: string;
  navItems: NavItem[];
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-aio-black text-aio-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-aio-charcoal lg:block">
        <SidebarContent title={title} navItems={navItems} pathname={pathname} userName={userName} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-aio-charcoal lg:hidden">
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X />
            </button>
          </div>
          <SidebarContent title={title} navItems={navItems} pathname={pathname} userName={userName} onNavigate={() => setMobileOpen(false)} />
        </div>
      ) : null}

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-aio-black px-4 py-3 lg:hidden">
          <span className="font-display font-bold">{title}</span>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
        </header>
        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  title,
  navItems,
  pathname,
  userName,
  onNavigate,
}: {
  title: string;
  navItems: NavItem[];
  pathname: string;
  userName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col p-5">
      <Link href="/" className="font-display text-sm font-bold">
        <span className="aio-metallic-text">ALL IN ONE</span> <span className="text-aio-red">SPORTS ACADEMY</span>
      </Link>
      <p className="mt-1 text-xs uppercase tracking-widest text-aio-silver">{title}</p>

      <nav className="mt-8 flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/coach" && item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block px-3 py-2 text-sm font-display uppercase tracking-wide text-aio-silver-light hover:bg-white/5 hover:text-aio-white",
                active && "bg-aio-red/10 text-aio-red"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 pt-4">
        <p className="truncate text-xs text-aio-silver">{userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-2 flex items-center gap-2 text-xs uppercase tracking-wide text-aio-silver hover:text-aio-red"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
