import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend({
    req,
    path: "/notifications/subscribe",
    method: "POST",
    body,
    requireAuth: true,
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend({
    req,
    path: "/notifications/unsubscribe",
    method: "DELETE",
    body,
    requireAuth: true,
  });
}
