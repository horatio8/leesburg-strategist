import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// In-memory store for shared sessions (in production, use a database)
const sharedSessions = new Map<string, unknown>();

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const id = uuidv4().slice(0, 8);

    sharedSessions.set(id, {
      ...data,
      createdAt: new Date().toISOString(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const shareUrl = `${baseUrl}/share/${id}`;

    return NextResponse.json({ shareUrl, id });
  } catch (error: unknown) {
    console.error("Share API error:", error);
    const message = error instanceof Error ? error.message : "Share failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  }

  const session = sharedSessions.get(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}
