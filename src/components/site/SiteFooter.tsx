import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Academy",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/coaches", label: "Coaches" },
      { href: "/athlete-success", label: "Athlete Success" },
      { href: "/apply-to-coach", label: "Join the AIO Coaching Team" },
    ],
  },
  {
    title: "Train",
    links: [
      { href: "/programs", label: "Training Programs" },
      { href: "/sports", label: "Sports" },
      { href: "/camps", label: "Camps & Clinics" },
      { href: "/packages", label: "Packages" },
      { href: "/book", label: "Book Training" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login?portal=client", label: "Client Login" },
      { href: "/login?portal=coach", label: "Coach Login" },
      { href: "/login?portal=admin", label: "Admin Login" },
      { href: "/register", label: "Create an Account" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/cancellation-policy", label: "Cancellation & Rescheduling" },
      { href: "/waiver-info", label: "Liability & Waiver Info" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-aio-black pb-24 pt-16 lg:pb-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Image src="/brand/aio-logo.png" alt="All In One Sports Academy" width={56} height={56} className="h-14 w-14" />
            <p className="mt-3 max-w-xs text-sm text-aio-silver">
              One Academy. Every Sport. Endless Possibilities.
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-aio-silver/70">
              Train. Develop. Compete. Succeed.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-display text-xs font-semibold uppercase tracking-widest text-aio-silver">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-aio-silver-light/80 hover:text-aio-red">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-aio-silver/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} All In One Sports Academy. Owned &amp; operated by Justin Woodall.</p>
          <p>All payments are final and nonrefundable. See our Cancellation &amp; Rescheduling Policy.</p>
        </div>
      </Container>
    </footer>
  );
}
