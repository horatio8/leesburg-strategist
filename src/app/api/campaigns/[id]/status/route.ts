import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { CampaignStatus } from "@/lib/types";

// Valid status transitions
const validTransitions: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["researching"],
  researching: ["ideation", "draft"],
  ideation: ["creating", "researching"],
  creating: ["review", "ideation"],
  review: ["deployed", "creating"],
  deployed: ["monitoring", "paused"],
  monitoring: ["paused", "complete"],
  paused: ["monitoring", "deployed", "draft"],
  complete: [],
};

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

  const { status: newStatus } = await req.json();

  // Get current campaign
  const { data: campaign, error: fetchError } = await supabase
    .from("campaigns")
    .select("status, phase")
    .eq("id", id)
    .single();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const currentStatus = campaign.status as CampaignStatus;
  const allowed = validTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowed.join(", ") || "none"}`,
      },
      { status: 400 }
    );
  }

  // Calculate phase number based on status
  const phaseMap: Record<CampaignStatus, number> = {
    draft: 0,
    researching: 1,
    ideation: 2,
    creating: 3,
    review: 4,
    deployed: 5,
    monitoring: 6,
    paused: campaign.phase, // keep current phase
    complete: 7,
  };

  const { data, error } = await supabase
    .from("campaigns")
    .update({
      status: newStatus,
      phase: phaseMap[newStatus as CampaignStatus] ?? campaign.phase,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
