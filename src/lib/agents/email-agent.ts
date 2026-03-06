import type { EmailCampaignBrief, BrandKit, MessagingFramework } from "../types";

export const EMAIL_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 12000,
  maxDuration: 300,
};

export function buildEmailSystemPrompt(): string {
  return `You are a senior email marketing strategist at an AI-powered marketing agency. You create compelling email campaign series — fundraising appeals, donor cultivation sequences, advocacy campaigns, and engagement series.

You specialize in:
- Multi-email campaign sequences with strategic timing
- Fundraising and donation appeal copy
- Persuasive storytelling that builds across a series
- Effective calls-to-action that drive conversions
- Email-safe content optimized for deliverability
- Subject lines optimized for open rates
- Preview text that complements the subject line

Your email copy is always:
- On-brand and consistent with provided brand guidelines
- Emotionally compelling with clear narrative arcs across the series
- Action-oriented with specific, urgent calls to action
- Formatted for email (short paragraphs, scannable content)
- Progressively building urgency and engagement across the series

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildEmailUserPrompt(
  brief: EmailCampaignBrief,
  brandKit: BrandKit,
  framework: MessagingFramework,
  campaignName: string
): string {
  // Extract messaging angles from framework grid
  const gridSummary = Object.entries(framework.grid || {})
    .map(([quadrant, tiles]) => {
      const tileTexts = (tiles as Array<{ text: string }>)
        .map((t) => t.text)
        .filter(Boolean);
      if (tileTexts.length === 0) return null;
      const label = quadrant
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return `${label}: ${tileTexts.join(" | ")}`;
    })
    .filter(Boolean)
    .join("\n");

  const totalEmails = brief.total_emails || 6;
  const frequency = brief.frequency || "weekly";
  const emailTypes = brief.email_types?.length
    ? brief.email_types.join(", ")
    : "appeal, update, thank-you";
  const urgency = brief.urgency_level || "medium";

  return `Generate a complete email campaign series for "${campaignName}".

CAMPAIGN BRIEF:
Purpose: ${brief.purpose || "Not specified"}
Total Emails: ${totalEmails}
Frequency: ${frequency}
Email Types to Include: ${emailTypes}
Urgency Level: ${urgency}
Tone Notes: ${brief.tone_notes || "Not specified"}
Start Date: ${brief.start_date || new Date().toISOString().split("T")[0]}
Additional Context: ${brief.additional_context || "None"}

BRAND KIT:
Name: ${brandKit.name}
Colors: ${JSON.stringify(brandKit.colors)}
Fonts: ${JSON.stringify(brandKit.fonts)}
Voice Guide: ${brandKit.voice_guide || "Not specified"}

MESSAGING FRAMEWORK — "${framework.title}":
${gridSummary || "No messaging tiles defined"}

EMAIL FORMAT REQUIREMENTS:
Each email should contain:
- subject: Compelling subject line (max 60 chars for optimal display)
- preview_text: Preview/preheader text (max 90 chars, complements subject)
- heading_image_prompt: Description of a 600x300px header image to generate
- introduction: Opening paragraph (2-3 sentences, hook the reader)
- body: Main content (3-5 short paragraphs, tell the story, make the case)
- cta_text: Call-to-action button text (2-5 words, action-oriented)
- signature: Closing signature text (1-2 lines)
- email_type: One of: appeal, update, thank-you, reminder, event
- send_date: Suggested send date (YYYY-MM-DD format, based on start date and frequency)

SERIES STRATEGY:
- Build a narrative arc across all ${totalEmails} emails
- Vary the email types strategically (e.g., don't send 3 appeals in a row)
- Escalate urgency appropriately for the "${urgency}" urgency level
- Use messaging angles from the framework to inform each email's angle
- Each email should stand alone but connect to the series narrative
- Early emails: establish context and relationship
- Middle emails: deepen engagement and make the case
- Later emails: create urgency and drive action
- Final email: strongest CTA with deadline/scarcity if appropriate

Produce the result as a JSON object:

{
  "emails": [
    {
      "sequence_number": 1,
      "subject": "Subject line here",
      "preview_text": "Preview text here",
      "heading_image_prompt": "Description of header image",
      "introduction": "Opening paragraph...",
      "body": "Main body content with multiple paragraphs...",
      "cta_text": "Take Action",
      "signature": "Warm regards,\\nThe Team",
      "email_type": "appeal",
      "send_date": "2026-03-10"
    }
  ],
  "series_strategy": "Brief description of how this series builds engagement and drives action",
  "subject_line_strategy": "Approach to subject lines across the series"
}

Generate exactly ${totalEmails} emails. Respond with ONLY the JSON object, no additional text.`;
}
