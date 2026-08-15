import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/providers/SessionProviderWrapper";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "All In One Sports Academy | One Academy. Every Sport.",
    template: "%s | All In One Sports Academy",
  },
  description:
    "All In One Sports Academy delivers premium multi-sport athletic training and coaching for youth and athletes. Train. Develop. Compete. Succeed.",
  icons: {
    icon: "/brand/aio-logo.png",
    apple: "/brand/aio-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-aio-black text-aio-white">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
