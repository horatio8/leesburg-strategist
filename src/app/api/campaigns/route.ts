import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = req.nextUrl.searchParams.get("org_id");
  if (!orgId) {
    return NextResponse.json(
      { error: "org_id is required" },
      { status: 400 }
    );
  }

  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("campaigns")
    .select("*")
    .eq("org_id", orgId)
    .order("updated_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

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

  const body = await req.json();
  const { org_id, name, brief, priority, platforms, brand_kit_id } = body;

  if (!org_id || !name) {
    return NextResponse.json(
      { error: "org_id and name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      org_id,
      name,
      brief: brief || {},
      priority: priority || "normal",
      platforms: platforms || [],
      brand_kit_id: brand_kit_id || null,
      created_by: user.id,
      status: "draft",
      phase: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
