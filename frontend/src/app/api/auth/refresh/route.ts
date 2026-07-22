import { NextRequest, NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth-cookie";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    const response = NextResponse.json(
      { message: "No refresh token" },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) {
      const response = NextResponse.json(data, { status: res.status });
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });
    setAuthCookies(response, data);
    return response;
  } catch {
    return NextResponse.json({ message: "Refresh failed" }, { status: 500 });
  }
}
