import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room") || "general";
  const limit = req.nextUrl.searchParams.get("limit") || "50";
  return proxyToBackend({
    req,
    path: "/chat/history",
    searchParams: new URLSearchParams({ room, limit }),
    requireAuth: true,
  });
}
