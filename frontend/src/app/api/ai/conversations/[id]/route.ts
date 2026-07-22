import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyToBackend({
    req,
    path: `/ai/conversations/${id}`,
    method: "GET",
    requireAuth: true,
  });
}
