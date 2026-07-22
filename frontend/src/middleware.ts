import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-cookie";

const PROTECTED_PREFIXES = ["/", "/dashboard", "/lessons"];
const AUTH_PAGES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isProtected =
    pathname === "/" ||
    PROTECTED_PREFIXES.filter((p) => p !== "/").some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/lessons/:path*", "/login", "/signup"],
};
