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

  // Pre-fill from campaign brief when creating from a campaign
  let prefillName = "";
  let prefillGoal = "";
  let prefillWebsite = "";
  let prefillTitle = "Untitled Framework";
  const prefillSocial = { twitter: "", facebook: "", instagram: "", linkedin: "", tiktok: "", youtube: "" };
  const prefillOppositions: { id: string; name: string; website: string }[] = [];

  if (campaignId) {
    const { data: campaign } = await admin
      .from("campaigns")
      .select("name, brief")
      .eq("id", campaignId)
      .single();

    if (campaign) {
      const brief = campaign.brief || {};
      prefillTitle = campaign.name || "Untitled Framework";
      prefillName = brief.brand_name || campaign.name || "";
      prefillWebsite = brief.website || "";

      // Combine goals and target audience into the strategic goal
      const parts = [brief.goals, brief.target_audience ? `Target audience: ${brief.target_audience}` : ""].filter(Boolean);
      prefillGoal = parts.join("\n\n");

      // Map competitors to oppositions
      if (Array.isArray(brief.competitors)) {
        brief.competitors.forEach((name: string, i: number) => {
          if (name.trim()) {
            prefillOppositions.push({ id: `opp-campaign-${i}`, name: name.trim(), website: "" });
          }
        });
      }

      // Map social URLs if available
      if (brief.social_urls) {
        for (const [key, value] of Object.entries(brief.social_urls)) {
          if (key in prefillSocial && typeof value === "string") {
            (prefillSocial as Record<string, string>)[key] = value;
          }
        }
      }
    }
  }

  const { data, error } = await admin
    .from("messaging_frameworks")
    .insert({
      user_id: user.id,
      campaign_id: campaignId,
      org_id: orgId,
      title: prefillTitle,
      current_step: 1,
      entity_type: "candidate",
      name: prefillName,
      location: "",
      goal: prefillGoal,
      website: prefillWebsite,
      social_media: prefillSocial,
      oppositions: prefillOppositions,
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
