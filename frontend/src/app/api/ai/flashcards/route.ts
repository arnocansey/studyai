import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  return proxyToBackend({
    req,
    path: "/ai/flashcards",
    method: "GET",
    requireAuth: true,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyToBackend({
    req,
    path: "/ai/flashcards/generate",
    method: "POST",
    body,
    requireAuth: true,
  });
}
