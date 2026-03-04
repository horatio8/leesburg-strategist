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

  // Fetch strategies and creative concepts in parallel
  const [
    { data: strategies, error: stratError },
    { data: concepts, error: conceptError },
  ] = await Promise.all([
    admin
      .from("campaign_strategies")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
    admin
      .from("creative_concepts")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (stratError) {
    return NextResponse.json({ error: stratError.message }, { status: 500 });
  }
  if (conceptError) {
    return NextResponse.json({ error: conceptError.message }, { status: 500 });
  }

  return NextResponse.json({
    strategies: strategies || [],
    concepts: concepts || [],
  });
}
