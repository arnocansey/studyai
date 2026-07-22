import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookie";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_missing_code", req.url),
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
      },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(data.message || "oauth_failed")}`,
          req.url,
        ),
      );
    }

    const response = NextResponse.redirect(new URL("/", req.url));
    setAuthCookies(response, data);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
