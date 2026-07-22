import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE } from "./auth-cookie";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export function getRequestToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }

  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  return cookieToken || null;
}

type ProxyOptions = {
  req: NextRequest;
  path: string;
  method?: string;
  body?: unknown;
  requireAuth?: boolean;
  searchParams?: URLSearchParams | string;
};

export async function proxyToBackend({
  req,
  path,
  method = "GET",
  body,
  requireAuth = false,
  searchParams,
}: ProxyOptions): Promise<NextResponse> {
  const token = getRequestToken(req);

  if (requireAuth && !token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const query =
    typeof searchParams === "string"
      ? searchParams
      : searchParams
        ? `?${searchParams.toString()}`
        : "";

  try {
    const res = await fetch(`${BACKEND_URL}${path}${query}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }

    return NextResponse.json(data ?? {}, { status: res.status });
  } catch {
    return NextResponse.json(
      { message: "Upstream request failed" },
      { status: 502 },
    );
  }
}
