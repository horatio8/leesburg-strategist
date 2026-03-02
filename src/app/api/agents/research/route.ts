import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  RESEARCH_AGENT_CONFIG,
  buildResearchSystemPrompt,
  buildResearchUserPrompt,
} from "@/lib/agents/research-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
  logDecision,
} from "@/lib/services/job-runner";
import { searchMetaAds, summarizeAdData } from "@/lib/services/meta-ad-library";
import type { CampaignBrief } from "@/lib/types";

export const maxDuration = 300; // Must be a literal for Next.js segment config

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

  // Fetch campaign with brief
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

  const brief = campaign.brief as CampaignBrief;

  // Create job (triggers Realtime for client)
  let job;
  try {
    job = await createJob(admin, {
      campaign_id,
      org_id: campaign.org_id,
      type: "research",
      input: { brief },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  // Return job ID immediately — client subscribes via Realtime
  const jobId = job.id;

  // Run research in the same request (within maxDuration)
  try {
    await startJob(admin, jobId);

    // 1. Optional: Fetch Meta Ad Library data for competitors
    let adLibraryData: Record<string, unknown> | null = null;
    if (brief.competitors?.length) {
      try {
        const adPromises = brief.competitors.map((competitor) =>
          searchMetaAds({
            search_terms: competitor,
            ad_active_status: "ALL",
            limit: 10,
          })
        );
        const adResults = await Promise.all(adPromises);
        const competitorAdData: Record<string, unknown> = {};
        brief.competitors.forEach((name, i) => {
          competitorAdData[name] = summarizeAdData(adResults[i].data);
        });
        adLibraryData = competitorAdData;
      } catch {
        // Ad Library is optional — continue without it
        console.warn("Meta Ad Library fetch failed, continuing without ad data");
      }
    }

    // 2. Run Claude research agent
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let userPrompt = buildResearchUserPrompt(brief);

    // Append ad library data if available
    if (adLibraryData) {
      userPrompt += `\n\nADDITIONAL DATA - Meta Ad Library Results:\n${JSON.stringify(adLibraryData, null, 2)}\n\nIncorporate this real ad data into your competitor analysis sections.`;
    }

    const message = await anthropic.messages.create({
      model: RESEARCH_AGENT_CONFIG.model,
      max_tokens: RESEARCH_AGENT_CONFIG.maxTokens,
      system: buildResearchSystemPrompt(),
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

    // 3. Store research entries in campaign_research table
    const researchEntries = [];

    // Market overview
    researchEntries.push({
      campaign_id,
      type: "social_audit",
      competitor_name: null,
      data: {
        market_overview: parsed.market_overview,
        audience_insights: parsed.audience_insights,
        social_audit: parsed.social_audit,
        seo_landscape: parsed.seo_landscape,
        brand_perception: parsed.brand_perception,
      },
      confidence: parsed.confidence_assessment?.overall || "medium",
      sources: [],
    });

    // Per-competitor entries
    if (parsed.competitor_analysis?.length) {
      for (const competitor of parsed.competitor_analysis) {
        researchEntries.push({
          campaign_id,
          type: "competitor",
          competitor_name: competitor.name,
          data: competitor,
          confidence: parsed.confidence_assessment?.overall || "medium",
          sources: [],
        });
      }
    }

    // Ad Library data
    if (adLibraryData) {
      researchEntries.push({
        campaign_id,
        type: "ad_library",
        competitor_name: null,
        data: adLibraryData,
        confidence: "high",
        sources: [{ label: "Meta Ad Library API" }],
      });
    }

    // Strategic recommendations
    if (parsed.strategic_recommendations?.length) {
      researchEntries.push({
        campaign_id,
        type: "sentiment",
        competitor_name: null,
        data: {
          recommendations: parsed.strategic_recommendations,
          confidence_assessment: parsed.confidence_assessment,
        },
        confidence: parsed.confidence_assessment?.overall || "medium",
        sources: [],
      });
    }

    const { error: insertError } = await admin
      .from("campaign_research")
      .insert(researchEntries);

    if (insertError) {
      throw new Error(`Failed to store research: ${insertError.message}`);
    }

    // 4. Log the decision
    await logDecision(admin, {
      campaign_id,
      agent: "research-agent",
      decision_type: "research_complete",
      decision: `Completed marketing research with ${researchEntries.length} findings`,
      reasoning: parsed.confidence_assessment?.notes || "Research conducted using AI analysis",
      evidence: {
        competitor_count: parsed.competitor_analysis?.length || 0,
        has_ad_data: !!adLibraryData,
        recommendations_count: parsed.strategic_recommendations?.length || 0,
      },
      confidence: parsed.confidence_assessment?.overall === "high" ? 0.85 : parsed.confidence_assessment?.overall === "low" ? 0.4 : 0.65,
    });

    // 5. Update campaign status to researching if still in draft
    const { data: currentCampaign } = await admin
      .from("campaigns")
      .select("status")
      .eq("id", campaign_id)
      .single();

    if (currentCampaign?.status === "draft") {
      await admin
        .from("campaigns")
        .update({
          status: "researching",
          phase: 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign_id);
    }

    // 6. Complete the job (triggers Realtime)
    await completeJob(admin, jobId, {
      research_count: researchEntries.length,
      competitors_analyzed: parsed.competitor_analysis?.length || 0,
      has_ad_library_data: !!adLibraryData,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Research failed";
    console.error("Research agent error:", error);
    await failJob(admin, jobId, message);
  }

  return NextResponse.json({ jobId });
}
