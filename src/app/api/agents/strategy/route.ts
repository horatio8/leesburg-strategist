import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  STRATEGY_AGENT_CONFIG,
  buildStrategySystemPrompt,
  buildStrategyUserPrompt,
} from "@/lib/agents/strategy-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
  logDecision,
} from "@/lib/services/job-runner";
import type { CampaignBrief, CampaignResearch } from "@/lib/types";

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

  // Fetch research data for this campaign
  const { data: research } = await admin
    .from("campaign_research")
    .select("*")
    .eq("campaign_id", campaign_id)
    .order("created_at", { ascending: false });

  if (!research?.length) {
    return NextResponse.json(
      { error: "No research data found. Run research first." },
      { status: 400 }
    );
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
      type: "strategy",
      input: { brief, research_count: research.length },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;

  // Run strategy agent
  try {
    await startJob(admin, jobId);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const userPrompt = buildStrategyUserPrompt(
      brief,
      research as CampaignResearch[]
    );

    const message = await anthropic.messages.create({
      model: STRATEGY_AGENT_CONFIG.model,
      max_tokens: STRATEGY_AGENT_CONFIG.maxTokens,
      system: buildStrategySystemPrompt(),
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

    // Store strategy
    const { data: strategy, error: stratError } = await admin
      .from("campaign_strategies")
      .insert({
        campaign_id,
        grid_data: {
          positioning: parsed.positioning,
          messaging_grid: parsed.messaging_grid,
          channel_strategy: parsed.channel_strategy,
          campaign_phases: parsed.campaign_phases,
          kpis: parsed.kpis,
        },
        concepts: parsed.creative_concepts || [],
        status: "draft",
      })
      .select()
      .single();

    if (stratError) {
      throw new Error(`Failed to store strategy: ${stratError.message}`);
    }

    // Store creative concepts as separate rows
    if (parsed.creative_concepts?.length) {
      const conceptRows = parsed.creative_concepts.map(
        (concept: Record<string, unknown>) => ({
          campaign_id,
          strategy_id: strategy.id,
          name: concept.name || "Untitled Concept",
          visual_direction: concept.visual_direction || null,
          headline_angles: concept.headline_angles || [],
          copy_tone: concept.copy_tone || null,
          platform_strategy: concept.platform_strategy || {},
          rationale: concept.rationale || null,
          status: "pending",
        })
      );

      await admin.from("creative_concepts").insert(conceptRows);
    }

    // Log the decision
    await logDecision(admin, {
      campaign_id,
      agent: "strategy-agent",
      decision_type: "strategy_complete",
      decision: `Generated marketing strategy with ${parsed.creative_concepts?.length || 0} creative concepts`,
      reasoning:
        "Strategy developed based on research findings, competitive analysis, and campaign objectives",
      evidence: {
        concepts_count: parsed.creative_concepts?.length || 0,
        channels: parsed.channel_strategy?.primary_channels || [],
        kpis_count: parsed.kpis?.length || 0,
        phases_count: parsed.campaign_phases?.length || 0,
      },
      confidence: 0.75,
    });

    // Update campaign status
    const { data: currentCampaign } = await admin
      .from("campaigns")
      .select("status")
      .eq("id", campaign_id)
      .single();

    if (
      currentCampaign?.status === "researching" ||
      currentCampaign?.status === "draft"
    ) {
      await admin
        .from("campaigns")
        .update({
          status: "ideation",
          phase: 2,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign_id);
    }

    // Complete job
    await completeJob(admin, jobId, {
      strategy_id: strategy.id,
      concepts_count: parsed.creative_concepts?.length || 0,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Strategy generation failed";
    console.error("Strategy agent error:", error);
    await failJob(admin, jobId, errorMessage);
  }

  return NextResponse.json({ jobId });
}
