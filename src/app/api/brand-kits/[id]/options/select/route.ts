import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandKitId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { option_ids, category } = await req.json();

  if (!option_ids || !Array.isArray(option_ids)) {
    return NextResponse.json(
      { error: "option_ids (array) is required" },
      { status: 400 }
    );
  }

  // If category is provided, deselect all other options in that category first
  if (category) {
    await admin
      .from("brand_kit_options")
      .update({ selected: false })
      .eq("brand_kit_id", brandKitId)
      .eq("category", category);
  }

  // Mark the specified options as selected
  const { data, error } = await admin
    .from("brand_kit_options")
    .update({ selected: true })
    .eq("brand_kit_id", brandKitId)
    .in("id", option_ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
