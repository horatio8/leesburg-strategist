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

  const status = req.nextUrl.searchParams.get("status");

  let query = admin
    .from("clients")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

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

  const admin = createServiceClient();
  const body = await req.json();
  const { org_id, name, industry, website, logo_url, notes } = body;

  if (!org_id || !name) {
    return NextResponse.json(
      { error: "org_id and name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("clients")
    .insert({
      org_id,
      name: name.trim(),
      industry: industry || null,
      website: website || null,
      logo_url: logo_url || null,
      notes: notes || null,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
