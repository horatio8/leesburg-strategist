import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messaging_frameworks")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("messaging_frameworks")
    .insert({
      user_id: user.id,
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
