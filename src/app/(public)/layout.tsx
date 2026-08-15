import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MobileBookingBar } from "@/components/site/MobileBookingBar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <SiteFooter />
      <MobileBookingBar />
    </>
  );
}
