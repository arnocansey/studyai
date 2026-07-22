import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/backend-proxy";

export async function GET() {
  return NextResponse.redirect(`${BACKEND_URL}/auth/github`);
}
