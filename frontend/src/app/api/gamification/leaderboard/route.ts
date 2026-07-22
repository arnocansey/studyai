import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return proxyToBackend({
    req,
    path: "/gamification/leaderboard",
    searchParams,
  });
}
