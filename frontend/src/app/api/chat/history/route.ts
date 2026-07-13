import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const room = req.nextUrl.searchParams.get('room') || 'general';
  const limit = req.nextUrl.searchParams.get('limit') || '50';

  try {
    const res = await fetch(`${BACKEND_URL}/chat/history?room=${room}&limit=${limit}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ messages: [] });
  }
}
