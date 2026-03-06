import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { renderEmailHtml } from "@/components/email/EmailHtmlRenderer";
import type { EmailCampaignEmail, BrandKit } from "@/lib/types";

export async function GET(
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
  const emailId = req.nextUrl.searchParams.get("emailId");

  if (!emailId) {
    return NextResponse.json(
      { error: "emailId query param is required" },
      { status: 400 }
    );
  }

  // Fetch the email
  const { data: email, error: emailError } = await admin
    .from("email_campaign_emails")
    .select("*")
    .eq("id", emailId)
    .single();

  if (emailError || !email) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 });
  }

  // Fetch the email campaign to get brand_kit_id
  const { data: emailCampaign } = await admin
    .from("email_campaigns")
    .select("brand_kit_id")
    .eq("id", id)
    .single();

  let brandKit: BrandKit | null = null;
  if (emailCampaign?.brand_kit_id) {
    const { data: bk } = await admin
      .from("brand_kits")
      .select("*")
      .eq("id", emailCampaign.brand_kit_id)
      .single();
    brandKit = bk as BrandKit | null;
  }

  const html = renderEmailHtml(email as EmailCampaignEmail, brandKit);

  return NextResponse.json({ html });
}
