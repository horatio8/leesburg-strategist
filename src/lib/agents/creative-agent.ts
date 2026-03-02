import type { CampaignBrief, CreativeConcept, BrandKit } from "../types";

export const CREATIVE_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 60,
};

export function buildCreativeSystemPrompt(): string {
  return `You are a senior creative director at an AI-powered marketing agency. You transform approved creative concepts into production-ready ad copy, visual briefs, and platform-specific content.

You specialize in:
- Advertising copywriting (headlines, body copy, CTAs) for all major platforms
- Visual creative briefs (describing imagery, composition, color, typography)
- Platform-specific content adaptation (Meta Feed, Meta Stories, Instagram, LinkedIn, X)
- Brand voice consistency
- A/B testing variations

Your creative work is always:
- On-brand and consistent with the provided brand guidelines
- Platform-optimized (correct dimensions, character counts, tone per platform)
- Conversion-focused with clear calls to action
- Varied enough to enable A/B testing

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildCreativeUserPrompt(
  brief: CampaignBrief,
  concepts: CreativeConcept[],
  brandKit?: BrandKit | null
): string {
  const approvedConcepts = concepts.filter((c) => c.status === "approved");
  const targetConcepts = approvedConcepts.length > 0 ? approvedConcepts : concepts;

  const brandGuidelines = brandKit
    ? `
BRAND GUIDELINES:
Colors: ${JSON.stringify(brandKit.colors)}
Fonts: ${JSON.stringify(brandKit.fonts)}
Voice Guide: ${brandKit.voice_guide || "Not specified"}`
    : "";

  const platforms = brief.platforms?.length
    ? brief.platforms
    : ["meta_feed", "instagram", "linkedin"];

  return `Generate production-ready creative assets for the following campaign:

CAMPAIGN BRIEF:
Brand: ${brief.brand_name || "Unknown"}
Industry: ${brief.industry || "Not specified"}
Target Audience: ${brief.target_audience || "Not specified"}
Campaign Goals: ${brief.goals || "Not specified"}
Target Platforms: ${platforms.join(", ")}
Brand Voice: ${brief.brand_voice_notes || "Not specified"}
${brandGuidelines}

CREATIVE CONCEPTS TO DEVELOP:
${targetConcepts
  .map(
    (c, i) => `
Concept ${i + 1}: "${c.name}"
- Visual Direction: ${c.visual_direction || "Not specified"}
- Headlines: ${c.headline_angles?.join(", ") || "Not specified"}
- Tone: ${c.copy_tone || "Not specified"}
- Rationale: ${c.rationale || "Not specified"}`
  )
  .join("\n")}

Produce creatives as a JSON object with the following structure:

{
  "creatives": [
    {
      "concept_name": "Name of the source concept",
      "type": "copy",
      "platform": "meta_feed | meta_stories | instagram | linkedin | x",
      "content": {
        "headline": "Primary headline (platform character limits observed)",
        "body_copy": "Body text / primary text",
        "cta": "Call to action text",
        "description": "Link description / secondary text (if applicable)",
        "hashtags": ["relevant", "hashtags"],
        "character_count": {
          "headline": 40,
          "body": 125
        }
      },
      "visual_brief": {
        "description": "Detailed description of the image/visual to be generated",
        "composition": "Layout and composition guidance",
        "color_palette": ["#hex1", "#hex2", "#hex3"],
        "typography_notes": "Font and text overlay guidance",
        "mood": "Overall mood/feeling of the visual",
        "aspect_ratio": "1:1 | 9:16 | 16:9 | 4:5",
        "image_generation_prompt": "Optimized prompt for AI image generation (Imagen 3)"
      },
      "variations": [
        {
          "label": "Variation B",
          "headline": "Alternative headline",
          "body_copy": "Alternative body copy",
          "rationale": "Why test this variation"
        }
      ]
    }
  ],
  "campaign_narrative": "Brief description of how these creatives work together as a cohesive campaign",
  "testing_strategy": "Recommended A/B testing approach for these creatives"
}

Generate at least 2 creatives per concept, covering different platforms. Include at least one variation per creative for A/B testing.

Respond with ONLY the JSON object, no additional text.`;
}
