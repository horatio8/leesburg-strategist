import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

  // Fetch strategies for this campaign
  const { data: strategies, error: stratError } = await admin
    .from("campaign_strategies")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  if (stratError) {
    return NextResponse.json({ error: stratError.message }, { status: 500 });
  }

  // Fetch creative concepts for this campaign
  const { data: concepts, error: conceptError } = await admin
    .from("creative_concepts")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });

  if (conceptError) {
    return NextResponse.json({ error: conceptError.message }, { status: 500 });
  }

  return NextResponse.json({
    strategies: strategies || [],
    concepts: concepts || [],
  });
}
