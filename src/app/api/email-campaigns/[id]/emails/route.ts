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
  const { data, error } = await admin
    .from("email_campaign_emails")
    .select("*")
    .eq("email_campaign_id", id)
    .order("sequence_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
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

  const { data, error } = await admin
    .from("email_campaign_emails")
    .insert({
      email_campaign_id: id,
      sequence_number: body.sequence_number || 1,
      send_date: body.send_date || null,
      subject: body.subject || "",
      preview_text: body.preview_text || "",
      heading_image_prompt: body.heading_image_prompt || "",
      heading_image_url: body.heading_image_url || "",
      introduction: body.introduction || "",
      body: body.body || "",
      cta_text: body.cta_text || "Learn More",
      cta_url: body.cta_url || "#",
      signature: body.signature || "",
      email_type: body.email_type || "appeal",
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
