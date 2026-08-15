"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/programs", label: "Programs" },
  { href: "/sports", label: "Sports" },
  { href: "/coaches", label: "Coaches" },
  { href: "/camps", label: "Camps & Clinics" },
  { href: "/packages", label: "Packages" },
  { href: "/athlete-success", label: "Athlete Success" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

const LOGIN_LINKS = [
  { href: "/login?portal=client", label: "Client Login" },
  { href: "/login?portal=coach", label: "Coach Login" },
  { href: "/login?portal=admin", label: "Admin Login" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="aio-header sticky top-0 z-50 overflow-hidden backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between sm:h-20">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/aio-logo-icon.png"
            alt="All In One Sports Academy"
            width={44}
            height={44}
            unoptimized
            className="h-10 w-10 opacity-80 sm:h-11 sm:w-11"
            priority
          />
          <span className="hidden font-display text-lg font-bold tracking-wider sm:inline">
            <span className="aio-metallic-text">ALL IN ONE</span> <span className="text-aio-red">SPORTS ACADEMY</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "font-display text-xs font-semibold uppercase tracking-wide text-aio-silver-light transition-colors hover:text-aio-red",
                pathname === link.href && "text-aio-red"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <div className="relative">
            <button
              onClick={() => setLoginOpen((v) => !v)}
              onBlur={() => setTimeout(() => setLoginOpen(false), 150)}
              className="flex items-center gap-1 font-display text-xs font-semibold uppercase tracking-wide text-aio-silver-light hover:text-aio-white"
            >
              Login <ChevronDown size={14} />
            </button>
            {loginOpen ? (
              <div className="absolute right-0 top-full mt-2 w-44 border border-white/10 bg-aio-charcoal py-2 shadow-xl">
                {LOGIN_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="block px-4 py-2 text-sm text-aio-silver-light hover:bg-white/5 hover:text-aio-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
          <ButtonLink href="/book" size="sm">
            Book Training — $80
          </ButtonLink>
        </div>

        <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </Container>

      {open ? (
        <div className="fixed inset-0 z-50 bg-aio-black lg:hidden">
          <Container className="flex h-16 items-center justify-between sm:h-20">
            <span className="font-display text-lg font-bold">MENU</span>
            <button aria-label="Close menu" onClick={() => setOpen(false)}>
              <X />
            </button>
          </Container>
          <Container className="flex flex-col gap-1 pb-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-4 font-display text-lg font-semibold uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {LOGIN_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2 font-display text-sm uppercase tracking-wide text-aio-silver-light"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <ButtonLink href="/book" className="mt-6 w-full" onClick={() => setOpen(false)}>
              Book Training — $80
            </ButtonLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
