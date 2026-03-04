import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  CREATIVE_AGENT_CONFIG,
  buildCreativeSystemPrompt,
  buildCreativeUserPrompt,
} from "@/lib/agents/creative-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
  logDecision,
} from "@/lib/services/job-runner";
import type { CampaignBrief, CreativeConcept, BrandKit } from "@/lib/types";

export const maxDuration = 300; // Vercel Pro plan

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { campaign_id } = await req.json();

  if (!campaign_id) {
    return NextResponse.json(
      { error: "campaign_id is required" },
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

  // Fetch creative concepts
  const { data: concepts } = await admin
    .from("creative_concepts")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("created_at", { ascending: false });

  if (!concepts?.length) {
    return NextResponse.json(
      { error: "No creative concepts found. Run strategy first." },
      { status: 400 }
    );
  }

  // Optionally fetch brand kit
  let brandKit: BrandKit | null = null;
  if (campaign.brand_kit_id) {
    const { data: bk } = await admin
      .from("brand_kits")
      .select("*")
      .eq("id", campaign.brand_kit_id)
      .single();
    brandKit = bk as BrandKit | null;
  }

  const brief = campaign.brief as CampaignBrief;

  // If campaign is under a client, augment brief with client data
  if (campaign.client_id) {
    const { data: client } = await admin
      .from("clients")
      .select("name, industry, website")
      .eq("id", campaign.client_id)
      .single();
    if (client) {
      if (!brief.brand_name && client.name) brief.brand_name = client.name;
      if (!brief.industry && client.industry) brief.industry = client.industry;
      if (!brief.website && client.website) brief.website = client.website;
    }
  }

  // Create job
  let job;
  try {
    job = await createJob(admin, {
      campaign_id,
      org_id: campaign.org_id,
      type: "creative",
      input: { brief, concepts_count: concepts.length },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;

  // Run creative agent
  try {
    await startJob(admin, jobId);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userPrompt = buildCreativeUserPrompt(
      brief,
      concepts as CreativeConcept[],
      brandKit
    );

    const message = await anthropic.messages.create({
      model: CREATIVE_AGENT_CONFIG.model,
      max_tokens: CREATIVE_AGENT_CONFIG.maxTokens,
      system: buildCreativeSystemPrompt(),
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

    // Store creatives
    const creativeRows = (
      parsed.creatives || []
    ).map(
      (creative: Record<string, unknown>) => {
        // Find the matching concept by name
        const matchingConcept = concepts.find(
          (c) =>
            c.name ===
            (creative.concept_name as string)
        );

        return {
          campaign_id,
          concept_id: matchingConcept?.id || null,
          type: (creative.type as string) || "copy",
          platform: (creative.platform as string) || "multi",
          content: {
            ...((creative.content as Record<string, unknown>) || {}),
            visual_brief: creative.visual_brief || null,
            variations: creative.variations || [],
          },
          status: "draft",
        };
      }
    );

    if (creativeRows.length > 0) {
      const { error: insertError } = await admin
        .from("creatives")
        .insert(creativeRows);

      if (insertError) {
        throw new Error(`Failed to store creatives: ${insertError.message}`);
      }
    }

    // Log the decision
    await logDecision(admin, {
      campaign_id,
      agent: "creative-agent",
      decision_type: "creative_generation",
      decision: `Generated ${creativeRows.length} creative assets across ${new Set(creativeRows.map((r: { platform: string }) => r.platform)).size} platforms`,
      reasoning:
        parsed.campaign_narrative ||
        "Creatives generated based on approved concepts and brand guidelines",
      evidence: {
        creatives_count: creativeRows.length,
        concepts_used: concepts.length,
        has_brand_kit: !!brandKit,
        testing_strategy: parsed.testing_strategy || null,
      },
      confidence: 0.7,
    });

    // Update campaign status
    const { data: currentCampaign } = await admin
      .from("campaigns")
      .select("status")
      .eq("id", campaign_id)
      .single();

    if (
      currentCampaign?.status === "ideation" ||
      currentCampaign?.status === "researching"
    ) {
      await admin
        .from("campaigns")
        .update({
          status: "creating",
          phase: 3,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign_id);
    }

    // Complete job
    await completeJob(admin, jobId, {
      creatives_count: creativeRows.length,
      campaign_narrative: parsed.campaign_narrative || null,
      testing_strategy: parsed.testing_strategy || null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Creative generation failed";
    console.error("Creative agent error:", error);
    await failJob(admin, jobId, errorMessage);
  }

  return NextResponse.json({ jobId });
}
