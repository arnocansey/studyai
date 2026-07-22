import { NextRequest, NextResponse } from "next/server";
import { getRequestToken, BACKEND_URL } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const token = getRequestToken(req);

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Return token for in-memory client use (WebSocket / direct API). Cookie remains httpOnly.
    return NextResponse.json({
      ...data,
      accessToken: token,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
