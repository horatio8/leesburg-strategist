import type { CampaignBrief } from "../types";

export const RESEARCH_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 300, // Vercel Pro plan
};

export function buildResearchSystemPrompt(): string {
  return `You are a senior marketing research analyst for an AI-powered marketing agency. You produce comprehensive, actionable intelligence reports that inform campaign strategy and creative direction.

Your research is data-driven, specific, and clearly distinguishes between verified facts and informed assessments. You flag confidence levels where appropriate.

You specialize in:
- Competitive analysis and market positioning
- Social media presence auditing
- Ad creative analysis (Meta Ad Library, etc.)
- SEO and digital footprint assessment
- Brand sentiment and audience perception
- Brand identity extraction (colors, voice, positioning)

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildResearchUserPrompt(brief: CampaignBrief): string {
  const competitors = brief.competitors?.length
    ? `\nKey Competitors: ${brief.competitors.join(", ")}`
    : "";

  const platforms = brief.platforms?.length
    ? `\nTarget Platforms: ${brief.platforms.join(", ")}`
    : "";

  const website = brief.website
    ? `\nBrand Website: ${brief.website}`
    : "";

  const socialUrls = brief.social_urls
    ? Object.entries(brief.social_urls)
        .filter(([, v]) => v?.trim())
        .map(([platform, url]) => `  ${platform}: ${url}`)
        .join("\n")
    : "";
  const socialSection = socialUrls
    ? `\nSocial Media:\n${socialUrls}`
    : "";

  return `Conduct a comprehensive marketing research analysis for the following campaign:

Brand: ${brief.brand_name || "Unknown"}
Industry: ${brief.industry || "Not specified"}
Target Audience: ${brief.target_audience || "Not specified"}
Campaign Goals: ${brief.goals || "Not specified"}
Budget Range: ${brief.budget_range || "Not specified"}${competitors}${platforms}${website}${socialSection}

Produce your findings as a JSON object with the following structure:

{
  "market_overview": {
    "summary": "2-3 paragraph overview of the market landscape, trends, and opportunities",
    "market_size": "Estimated market size and growth trajectory if applicable",
    "key_trends": ["trend 1", "trend 2", "trend 3"]
  },
  "competitor_analysis": [
    {
      "name": "Competitor Name",
      "positioning": "How they position themselves in the market",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "ad_strategy": "Summary of their advertising approach, estimated spend, key platforms",
      "messaging_themes": ["theme 1", "theme 2"],
      "visual_style": "Description of their visual brand identity and creative direction"
    }
  ],
  "audience_insights": {
    "demographics": "Key demographic characteristics of the target audience",
    "psychographics": "Values, interests, behaviors, and media consumption",
    "pain_points": ["pain point 1", "pain point 2"],
    "motivations": ["motivation 1", "motivation 2"],
    "preferred_channels": ["channel 1", "channel 2"]
  },
  "social_audit": {
    "brand_presence": "Assessment of the brand's current social media presence",
    "engagement_benchmarks": "Industry engagement rate benchmarks by platform",
    "content_gaps": ["gap 1", "gap 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "seo_landscape": {
    "key_terms": ["term 1", "term 2", "term 3"],
    "content_opportunities": "Areas where the brand can gain organic visibility",
    "competitor_seo_strengths": "What competitors are ranking for"
  },
  "brand_perception": {
    "current_positioning": "How the brand is currently perceived in the market",
    "sentiment": "Overall sentiment assessment (positive/neutral/negative with explanation)",
    "differentiation_opportunities": ["opportunity 1", "opportunity 2"]
  },
  "strategic_recommendations": [
    {
      "area": "e.g. Messaging, Channels, Creative",
      "recommendation": "Specific actionable recommendation",
      "rationale": "Why this matters",
      "priority": "high | medium | low"
    }
  ],
  "confidence_assessment": {
    "overall": "high | medium | low",
    "notes": "Any caveats about data availability or assumptions made"
  }
}

${brief.competitors?.length ? `IMPORTANT: Analyze each of these competitors in detail: ${brief.competitors.join(", ")}. If you cannot find specific data, provide your best assessment based on the industry and note the lower confidence.` : "If no competitors are specified, identify the top 2-3 likely competitors based on the brand and industry."}

Respond with ONLY the JSON object, no additional text.`;
}
