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
  const campaignId = req.nextUrl.searchParams.get("campaign_id");

  if (!campaignId) {
    return NextResponse.json(
      { error: "campaign_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("email_campaigns")
    .select("*")
    .eq("campaign_id", campaignId)
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
  const { campaign_id, org_id, name, brand_kit_id, framework_id, brief } = body;

  if (!campaign_id || !org_id) {
    return NextResponse.json(
      { error: "campaign_id and org_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("email_campaigns")
    .insert({
      campaign_id,
      org_id,
      name: name || "Untitled Email Campaign",
      brand_kit_id: brand_kit_id || null,
      framework_id: framework_id || null,
      brief: brief || {},
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
