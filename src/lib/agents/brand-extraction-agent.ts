export const BRAND_EXTRACTION_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 300,
};

export function buildExtractionSystemPrompt(): string {
  return `You are a senior brand identity analyst for an AI-powered marketing agency. You specialize in extracting brand identity elements from websites and digital properties.

Given raw HTML content from a website, you identify and extract:
- Logo URLs in the HIGHEST RESOLUTION available (prioritize SVG, then large PNG/JPG, then smaller versions)
- Brand colors (from CSS custom properties, inline styles, class-based patterns, meta theme-color)
- Typography (font-family declarations, Google Fonts / Adobe Fonts links)
- Brand voice and tone (analyzed from page copy, headlines, CTAs)
- Visual style direction (layout patterns, imagery style, design sophistication level)

Logo extraction priority order (highest quality first):
1. SVG logos (<img src="*.svg">, <svg> inline elements, link[rel="icon"][type="image/svg+xml"])
2. apple-touch-icon-precomposed or apple-touch-icon (180x180 or larger)
3. og:image meta tag (typically high resolution)
4. Large logo images (look for "logo" in src/alt/class attributes, prefer images with width >= 200px)
5. favicon links with sizes attribute (prefer largest: 192x192, 512x512)
6. Standard favicon.ico as last resort

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
    "logo_urls": ["absolute URL to HIGHEST RESOLUTION logo first", "additional logo URLs in descending quality order"],
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
- CRITICAL: Order logo_urls by resolution/quality — SVG first, then largest raster images, smallest last
- Look for logos in these locations: <img> tags with "logo" in src/alt/class, <link rel="icon">, <link rel="apple-touch-icon">, <meta property="og:image">, inline <svg> with logo-related id/class, manifest icons
- If you find a logo path like "/logo.png", also check for "/logo.svg" variant (include both URLs)
- For colors, prefer CSS custom properties (--primary, --brand-color, etc.) over individual element styles
- For fonts, look for @font-face declarations, Google Fonts links, and font-family CSS properties
- If certain elements cannot be determined, use your best inference and note lower confidence
- Ignore generic framework colors (Tailwind defaults, Bootstrap defaults) unless they appear customized
- Focus on the BRAND colors, not standard UI chrome colors

Respond with ONLY the JSON object, no additional text.`;
}
