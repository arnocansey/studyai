import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookie";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": req.headers.get("user-agent") || "",
      },
      body: JSON.stringify(body),
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
    setAuthCookies(response, data);
    return response;
  } catch {
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
