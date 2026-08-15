import { ButtonLink } from "@/components/ui/Button";

export function MobileBookingBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-aio-black/95 p-3 backdrop-blur lg:hidden">
      <ButtonLink href="/book" className="w-full">
        Book Training — $80/hr
      </ButtonLink>
    </div>
  );
}
