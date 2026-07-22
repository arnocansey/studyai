import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth-cookie";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        name: body.name,
        password: body.password,
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const response = NextResponse.json({
      user: data.user,
      accessToken: data.accessToken,
    });

    if (data.accessToken) {
      response.cookies.set(AUTH_COOKIE, data.accessToken, authCookieOptions);
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
