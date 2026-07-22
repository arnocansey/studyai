import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const { lessonId } = await params;
  return proxyToBackend({
    req,
    path: `/quiz/lesson/${lessonId}`,
    requireAuth: true,
  });
}
