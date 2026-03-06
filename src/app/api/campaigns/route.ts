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
  const clientId = req.nextUrl.searchParams.get("client_id");

  if (!orgId) {
    return NextResponse.json(
      { error: "org_id is required" },
      { status: 400 }
    );
  }

  const status = req.nextUrl.searchParams.get("status");

  let query = admin
    .from("campaigns")
    .select("*")
    .eq("org_id", orgId)
    .order("updated_at", { ascending: false });

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

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
  const { org_id, client_id, name, brief, priority, platforms } = body;

  if (!org_id || !name) {
    return NextResponse.json(
      { error: "org_id and name are required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("campaigns")
    .insert({
      org_id,
      client_id: client_id || null,
      name,
      brief: brief || {},
      priority: priority || "normal",
      platforms: platforms || [],
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
