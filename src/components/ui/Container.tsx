import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-2 font-display text-xs font-semibold tracking-[0.25em] text-aio-red">{eyebrow}</p>
      ) : null}
      <h2 className={cn("text-3xl sm:text-4xl font-bold", light ? "text-aio-white" : "text-aio-black")}>{title}</h2>
      {subtitle ? (
        <p className={cn("mt-4 text-base normal-case", light ? "text-aio-silver-light/90" : "text-aio-charcoal-2/80")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
