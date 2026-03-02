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
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("org_id");
  const campaignId = searchParams.get("campaign_id");
  const status = searchParams.get("status");

  let query = admin
    .from("approvals")
    .select("*, campaign:campaigns(id, name, status)")
    .order("created_at", { ascending: false });

  if (orgId) {
    query = query.eq("org_id", orgId);
  }
  if (campaignId) {
    query = query.eq("campaign_id", campaignId);
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
  const { campaign_id, org_id, type, item_id, item_summary, agent_reasoning } =
    body;

  if (!campaign_id || !org_id || !type || !item_id) {
    return NextResponse.json(
      { error: "campaign_id, org_id, type, and item_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await admin
    .from("approvals")
    .insert({
      campaign_id,
      org_id,
      type,
      item_id,
      item_summary: item_summary || null,
      agent_reasoning: agent_reasoning || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
