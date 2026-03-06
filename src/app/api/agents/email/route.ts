import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  EMAIL_AGENT_CONFIG,
  buildEmailSystemPrompt,
  buildEmailUserPrompt,
} from "@/lib/agents/email-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
  logDecision,
} from "@/lib/services/job-runner";
import type { EmailCampaignBrief, BrandKit, MessagingFramework } from "@/lib/types";

export const maxDuration = 300;

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
  const { campaign_id, email_campaign_id, brand_kit_id, framework_id, brief, name } = body;

  if (!campaign_id || !brand_kit_id || !framework_id) {
    return NextResponse.json(
      { error: "campaign_id, brand_kit_id, and framework_id are required" },
      { status: 400 }
    );
  }

  // Fetch campaign
  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .select("*")
    .eq("id", campaign_id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json(
      { error: "Campaign not found" },
      { status: 404 }
    );
  }

  // Fetch brand kit
  const { data: bk } = await admin
    .from("brand_kits")
    .select("*")
    .eq("id", brand_kit_id)
    .single();
  const brandKit = bk as BrandKit | null;

  if (!brandKit) {
    return NextResponse.json(
      { error: "Brand kit not found" },
      { status: 404 }
    );
  }

  // Fetch framework
  const { data: fw } = await admin
    .from("messaging_frameworks")
    .select("*")
    .eq("id", framework_id)
    .single();
  const framework = fw as MessagingFramework | null;

  if (!framework) {
    return NextResponse.json(
      { error: "Messaging framework not found" },
      { status: 404 }
    );
  }

  const emailBrief = (brief || {}) as EmailCampaignBrief;
  const campaignName = name || campaign.name || "Email Campaign";

  // Create or update email campaign record
  let emailCampaignId = email_campaign_id;
  if (!emailCampaignId) {
    const { data: ec, error: ecError } = await admin
      .from("email_campaigns")
      .insert({
        campaign_id,
        org_id: campaign.org_id,
        name: campaignName,
        brand_kit_id,
        framework_id,
        brief: emailBrief,
        status: "generating",
      })
      .select()
      .single();

    if (ecError || !ec) {
      return NextResponse.json(
        { error: "Failed to create email campaign" },
        { status: 500 }
      );
    }
    emailCampaignId = ec.id;
  } else {
    await admin
      .from("email_campaigns")
      .update({ status: "generating", updated_at: new Date().toISOString() })
      .eq("id", emailCampaignId);
  }

  // Create job
  let job;
  try {
    job = await createJob(admin, {
      campaign_id,
      org_id: campaign.org_id,
      type: "email",
      input: {
        email_campaign_id: emailCampaignId,
        brand_kit_id,
        framework_id,
        brief: emailBrief,
      },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;

  // Run email agent
  try {
    await startJob(admin, jobId);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userPrompt = buildEmailUserPrompt(
      emailBrief,
      brandKit,
      framework,
      campaignName
    );

    const message = await anthropic.messages.create({
      model: EMAIL_AGENT_CONFIG.model,
      max_tokens: EMAIL_AGENT_CONFIG.maxTokens,
      system: buildEmailSystemPrompt(),
      messages: [{ role: "user", content: userPrompt }],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in AI response");
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // Store emails
    const emailRows = (parsed.emails || []).map(
      (email: Record<string, unknown>, index: number) => ({
        email_campaign_id: emailCampaignId,
        sequence_number: (email.sequence_number as number) || index + 1,
        send_date: (email.send_date as string) || null,
        subject: (email.subject as string) || "",
        preview_text: (email.preview_text as string) || "",
        heading_image_prompt: (email.heading_image_prompt as string) || "",
        heading_image_url: "",
        introduction: (email.introduction as string) || "",
        body: (email.body as string) || "",
        cta_text: (email.cta_text as string) || "Learn More",
        cta_url: "#",
        signature: (email.signature as string) || "",
        email_type: (email.email_type as string) || "appeal",
        status: "draft",
      })
    );

    if (emailRows.length > 0) {
      const { error: insertError } = await admin
        .from("email_campaign_emails")
        .insert(emailRows);

      if (insertError) {
        throw new Error(`Failed to store emails: ${insertError.message}`);
      }
    }

    // Update email campaign status
    await admin
      .from("email_campaigns")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", emailCampaignId);

    // Log the decision
    await logDecision(admin, {
      campaign_id,
      agent: "email-agent",
      decision_type: "email_generation",
      decision: `Generated ${emailRows.length} emails for email campaign "${campaignName}"`,
      reasoning:
        parsed.series_strategy ||
        "Email series generated based on brand kit and messaging framework",
      evidence: {
        emails_count: emailRows.length,
        email_campaign_id: emailCampaignId,
        brand_kit_id,
        framework_id,
        series_strategy: parsed.series_strategy || null,
        subject_line_strategy: parsed.subject_line_strategy || null,
      },
      confidence: 0.7,
    });

    // Complete job
    await completeJob(admin, jobId, {
      emails_count: emailRows.length,
      email_campaign_id: emailCampaignId,
      series_strategy: parsed.series_strategy || null,
      subject_line_strategy: parsed.subject_line_strategy || null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Email generation failed";
    console.error("Email agent error:", error);
    await failJob(admin, jobId, errorMessage);

    // Revert email campaign status on failure
    await admin
      .from("email_campaigns")
      .update({ status: "draft", updated_at: new Date().toISOString() })
      .eq("id", emailCampaignId);
  }

  return NextResponse.json({ jobId, emailCampaignId });
}
