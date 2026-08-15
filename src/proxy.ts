import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.edge";

/**
 * Backend/route-level enforcement of portal access. Hidden navigation is
 * never treated as a security boundary — every protected route group is
 * gated here in addition to per-request checks inside server actions/API
 * routes.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  const redirectToLogin = (portal: string) => {
    const url = new URL(`/login`, req.url);
    url.searchParams.set("portal", portal);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/admin")) {
    if (!session) return redirectToLogin("admin");
    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?portal=admin&error=forbidden", req.url));
    }
  }

  if (pathname.startsWith("/coach")) {
    if (!session) return redirectToLogin("coach");
    if (role !== "COACH") {
      return NextResponse.redirect(new URL("/login?portal=coach&error=forbidden", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) return redirectToLogin("client");
    if (role !== "CLIENT") {
      return NextResponse.redirect(new URL("/login?portal=client&error=forbidden", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/coach/:path*", "/dashboard/:path*"],
};
