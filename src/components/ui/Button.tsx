import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-aio-red text-white hover:bg-aio-red-dark shadow-[0_0_0_1px_rgba(224,18,24,0.4)] hover:shadow-[0_0_20px_rgba(224,18,24,0.45)]",
  secondary: "bg-aio-white text-aio-black hover:bg-aio-silver-light",
  outline: "border border-aio-silver/50 text-aio-white hover:border-aio-red hover:text-aio-red",
  ghost: "text-aio-white hover:text-aio-red",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide uppercase transition-all duration-200 aio-focus-ring disabled:opacity-50 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </Link>
  );
}
