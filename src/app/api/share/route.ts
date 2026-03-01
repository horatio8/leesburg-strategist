import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const id = uuidv4().slice(0, 8);

    const { error } = await supabase
      .from("shared_sessions")
      .insert({
        id,
        framework_id: data.frameworkId || null,
        data: {
          researchInput: data.researchInput,
          researchSections: data.researchSections,
          grid: data.grid,
          createdAt: new Date().toISOString(),
        },
      });

    if (error) {
      console.error("Share insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shared_sessions")
    .select("data")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(data.data);
}
