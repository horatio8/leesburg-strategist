export const BRAND_EXTRACTION_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 300,
};

export function buildExtractionSystemPrompt(): string {
  return `You are a senior brand identity analyst for an AI-powered marketing agency. You specialize in extracting brand identity elements from websites and digital properties.

Given raw HTML content from a website, you identify and extract:
- Logo URLs (from <img> tags, favicon links, og:image meta tags)
- Brand colors (from CSS custom properties, inline styles, class-based patterns, meta theme-color)
- Typography (font-family declarations, Google Fonts / Adobe Fonts links)
- Brand voice and tone (analyzed from page copy, headlines, CTAs)
- Visual style direction (layout patterns, imagery style, design sophistication level)

You are precise and methodical. You distinguish between primary brand colors and accent/UI colors. You prioritize semantic color names (e.g., "primary", "secondary", "accent") over generic names.

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildExtractionUserPrompt(
  html: string,
  sourceUrl: string
): string {
  return `Analyze the following website HTML and extract the brand identity elements.

Source URL: ${sourceUrl}

HTML Content (truncated):
${html}

Extract brand identity and return as a JSON object with this exact structure:

{
  "extraction": {
    "logo_urls": ["absolute URL to logo image 1", "absolute URL to logo image 2"],
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "text": "#hex",
      "muted": "#hex"
    },
    "fonts": {
      "heading": "Font Family Name",
      "body": "Font Family Name",
      "caption": "Font Family Name (if different)"
    },
    "voice_analysis": "2-3 sentence description of the brand's voice and tone based on the copy, headlines, and CTAs found on the page. Include observations about formality level, personality, and communication style.",
    "visual_style": "2-3 sentence description of the overall visual direction: design sophistication, imagery style, use of whitespace, layout approach, and any distinctive visual patterns."
  },
  "confidence": {
    "logo": "high | medium | low",
    "colors": "high | medium | low",
    "fonts": "high | medium | low",
    "voice": "high | medium | low",
    "overall": "high | medium | low",
    "notes": "Any caveats about the extraction, e.g., limited CSS available, JavaScript-rendered content not captured, etc."
  }
}

Guidelines:
- For logo_urls, convert relative paths to absolute URLs using the source URL as base
- For colors, prefer CSS custom properties (--primary, --brand-color, etc.) over individual element styles
- For fonts, look for @font-face declarations, Google Fonts links, and font-family CSS properties
- If certain elements cannot be determined, use your best inference and note lower confidence
- Ignore generic framework colors (Tailwind defaults, Bootstrap defaults) unless they appear customized
- Focus on the BRAND colors, not standard UI chrome colors

Respond with ONLY the JSON object, no additional text.`;
}
