import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const campaignId = req.nextUrl.searchParams.get("campaign_id");
  const orgId = req.nextUrl.searchParams.get("org_id");

  const admin = createServiceClient();

  // If filtering by campaign, use service client (org-scoped)
  if (campaignId) {
    const { data, error } = await admin
      .from("messaging_frameworks")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // If filtering by org, return all org frameworks
  if (orgId) {
    const { data, error } = await admin
      .from("messaging_frameworks")
      .select("*")
      .eq("org_id", orgId)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  // Default: return user's own frameworks (legacy behavior)
  const { data, error } = await supabase
    .from("messaging_frameworks")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let campaignId: string | null = null;
  let orgId: string | null = null;

  // Try to parse body for campaign_id and org_id
  try {
    const body = await req.json();
    campaignId = body.campaign_id || null;
    orgId = body.org_id || null;
  } catch {
    // No body provided — legacy behavior
  }

  const admin = createServiceClient();

  const { data, error } = await admin
    .from("messaging_frameworks")
    .insert({
      user_id: user.id,
      campaign_id: campaignId,
      org_id: orgId,
      title: "Untitled Framework",
      current_step: 1,
      entity_type: "candidate",
      name: "",
      location: "",
      goal: "",
      website: "",
      social_media: { twitter: "", facebook: "", instagram: "", linkedin: "", tiktok: "", youtube: "" },
      research_sections: [],
      map_data: null,
      wells: { "our-story": [], "the-attack": [], "their-defense": [], "the-counter": [] },
      grid: { "our-story": [], "the-attack": [], "their-defense": [], "the-counter": [] },
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
