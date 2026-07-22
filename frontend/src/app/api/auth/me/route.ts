import { NextRequest, NextResponse } from "next/server";
import { getRequestToken, BACKEND_URL } from "@/lib/backend-proxy";
import {
  AUTH_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth-cookie";

async function fetchMe(token: string) {
  return fetch(`${BACKEND_URL}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
}

export async function GET(req: NextRequest) {
  let token = getRequestToken(req);
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  if (!token && !refreshToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    if (token) {
      const res = await fetchMe(token);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ ...data, accessToken: token });
      }
    }

    if (!refreshToken) {
      const response = NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    const refreshData = await refreshRes.json();
    if (!refreshRes.ok) {
      const response = NextResponse.json(refreshData, {
        status: refreshRes.status,
      });
      clearAuthCookies(response);
      return response;
    }

    const accessToken =
      typeof refreshData.accessToken === "string"
        ? refreshData.accessToken
        : null;
    if (!accessToken) {
      const response = NextResponse.json(
        { message: "Refresh did not return an access token" },
        { status: 401 },
      );
      clearAuthCookies(response);
      return response;
    }

    token = accessToken;
    const meRes = await fetchMe(accessToken);
    const meData = await meRes.json();
    if (!meRes.ok) {
      const response = NextResponse.json(meData, { status: meRes.status });
      clearAuthCookies(response);
      return response;
    }

    const response = NextResponse.json({
      ...meData,
      accessToken,
    });
    setAuthCookies(response, refreshData);
    response.cookies.set(AUTH_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
