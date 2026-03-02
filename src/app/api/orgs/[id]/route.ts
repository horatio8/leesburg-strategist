import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// GET /api/orgs/[id] — get org details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data: org, error } = await admin
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(org);
}

// PATCH /api/orgs/[id] — update org details
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const body = await req.json();
  const { name, industry, website, logo_url } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (industry !== undefined) updates.industry = industry;
  if (website !== undefined) updates.website = website;
  if (logo_url !== undefined) updates.logo_url = logo_url;

  const { data: org, error } = await admin
    .from("organizations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(org);
}
