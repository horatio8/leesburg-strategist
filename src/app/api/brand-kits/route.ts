import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const orgId = req.nextUrl.searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json(
      { error: "org_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("brand_kits")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const body = await req.json();
  const { org_id, name, colors, fonts, voice_guide, logo_urls } = body;

  if (!org_id) {
    return NextResponse.json(
      { error: "org_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("brand_kits")
    .insert({
      org_id,
      name: name || "Default",
      colors: colors || {},
      fonts: fonts || {},
      voice_guide: voice_guide || null,
      logo_urls: logo_urls || [],
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
