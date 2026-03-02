import type { CampaignBrief, CampaignResearch } from "../types";

export const STRATEGY_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 300,
};

export function buildStrategySystemPrompt(): string {
  return `You are a senior marketing strategist for an AI-powered marketing agency. You transform research insights into actionable campaign strategies, messaging frameworks, and creative concepts.

You specialize in:
- Brand positioning and differentiation strategy
- Messaging grid development (key messages organized by audience segment and channel)
- Creative concept ideation (campaign themes, visual directions, tone)
- Platform-specific strategy (Meta, Instagram, LinkedIn, X, TikTok)
- Competitive positioning and counter-messaging

Your strategies are always grounded in the research data provided. You clearly explain the strategic rationale behind every recommendation.

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildStrategyUserPrompt(
  brief: CampaignBrief,
  research: CampaignResearch[]
): string {
  // Compile research findings
  const researchSummary = research.map((r) => ({
    type: r.type,
    competitor_name: r.competitor_name,
    confidence: r.confidence,
    data: r.data,
  }));

  const platforms = brief.platforms?.length
    ? brief.platforms.join(", ")
    : "Meta, Instagram, LinkedIn";

  return `Based on the following campaign brief and research findings, develop a comprehensive marketing strategy:

CAMPAIGN BRIEF:
Brand: ${brief.brand_name || "Unknown"}
Industry: ${brief.industry || "Not specified"}
Target Audience: ${brief.target_audience || "Not specified"}
Campaign Goals: ${brief.goals || "Not specified"}
Budget Range: ${brief.budget_range || "Not specified"}
Target Platforms: ${platforms}
Brand Voice: ${brief.brand_voice_notes || "Not specified"}

RESEARCH FINDINGS:
${JSON.stringify(researchSummary, null, 2)}

Produce your strategy as a JSON object with the following structure:

{
  "positioning": {
    "statement": "Core positioning statement (1-2 sentences)",
    "value_proposition": "Primary value proposition",
    "differentiators": ["key differentiator 1", "key differentiator 2", "key differentiator 3"],
    "competitive_advantage": "What makes this brand uniquely positioned"
  },
  "messaging_grid": {
    "primary_message": "The single most important message for the campaign",
    "supporting_messages": [
      {
        "message": "Supporting message text",
        "audience_segment": "Who this message targets",
        "channels": ["channel 1", "channel 2"],
        "tone": "Tone/voice for this message"
      }
    ],
    "proof_points": ["evidence/fact 1", "evidence/fact 2", "evidence/fact 3"],
    "call_to_action_options": ["CTA option 1", "CTA option 2", "CTA option 3"]
  },
  "creative_concepts": [
    {
      "name": "Concept name/theme",
      "tagline": "Campaign tagline or hook",
      "visual_direction": "Description of visual style, imagery, colors",
      "headline_angles": ["headline 1", "headline 2", "headline 3"],
      "copy_tone": "Description of copy voice and style",
      "platform_strategy": {
        "meta_feed": "How this concept adapts for Meta feed ads",
        "meta_stories": "How this concept adapts for Stories",
        "instagram": "Instagram-specific approach",
        "linkedin": "LinkedIn-specific approach",
        "x": "X/Twitter-specific approach"
      },
      "rationale": "Why this concept will resonate with the target audience"
    }
  ],
  "channel_strategy": {
    "primary_channels": ["channel 1", "channel 2"],
    "channel_roles": {
      "channel_name": "Role this channel plays in the campaign"
    },
    "budget_allocation_recommendation": {
      "channel_name": "percentage and rationale"
    },
    "content_cadence": {
      "channel_name": "posting frequency and content type"
    }
  },
  "campaign_phases": [
    {
      "phase_name": "Phase name",
      "duration": "Estimated duration",
      "objective": "Phase objective",
      "key_activities": ["activity 1", "activity 2"],
      "success_metrics": ["metric 1", "metric 2"]
    }
  ],
  "kpis": [
    {
      "metric": "KPI name",
      "target": "Target value",
      "measurement_method": "How to track this"
    }
  ]
}

Generate 2-3 distinct creative concepts that offer different strategic angles. Each should be viable and substantively different.

Respond with ONLY the JSON object, no additional text.`;
}
