import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  return proxyToBackend({ req, path: "/study-groups", requireAuth: false });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend({
    req,
    path: "/study-groups",
    method: "POST",
    body,
    requireAuth: true,
  });
}
