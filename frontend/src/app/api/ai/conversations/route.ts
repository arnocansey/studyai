import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(req: NextRequest) {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const searchParams = new URLSearchParams();
  if (lessonId) searchParams.set("lessonId", lessonId);

  return proxyToBackend({
    req,
    path: "/ai/conversations",
    method: "GET",
    requireAuth: true,
    searchParams: searchParams.toString() ? searchParams : undefined,
  });
}
