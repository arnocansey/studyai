import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth-cookie";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  try {
    if (refreshToken) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    }
  } catch {
    // still clear cookies locally
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
