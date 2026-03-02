export const BRAND_GENERATION_AGENT_CONFIG = {
  model: "claude-sonnet-4-20250514" as const,
  maxTokens: 8000,
  maxDuration: 60,
};

export function buildGenerationSystemPrompt(): string {
  return `You are a world-class brand strategist and identity designer for an AI-powered marketing agency. You create compelling, differentiated brand identities that resonate with target audiences and stand out in competitive markets.

Your expertise spans:
- Color psychology and palette creation
- Typography pairing and hierarchy
- Brand voice and tone development
- Visual style direction
- Logo concept ideation

You generate multiple options for each brand element so clients can choose what resonates. Each option is distinct and well-rationalized. You balance creativity with practical applicability across digital and print media.

Always structure your output as valid JSON. Never include markdown code fences or commentary outside the JSON.`;
}

export function buildGenerationUserPrompt(input: {
  brand_name: string;
  industry: string;
  target_audience: string;
  personality_traits: string[];
}): string {
  const traits = input.personality_traits.length
    ? `Brand Personality Traits: ${input.personality_traits.join(", ")}`
    : "Brand Personality Traits: Not specified (suggest appropriate traits)";

  return `Create a comprehensive brand identity system for the following brand:

Brand Name: ${input.brand_name}
Industry: ${input.industry}
Target Audience: ${input.target_audience}
${traits}

Generate multiple options for each brand element. Return as a JSON object with this exact structure:

{
  "palettes": [
    {
      "name": "Palette name (e.g., 'Bold & Modern', 'Earthy Warmth')",
      "colors": {
        "primary": "#hex",
        "secondary": "#hex",
        "accent": "#hex",
        "background": "#hex",
        "text": "#hex",
        "muted": "#hex"
      },
      "mood": "1-2 word mood description",
      "rationale": "2-3 sentences explaining why this palette works for the brand, audience, and industry. Reference color psychology."
    },
    {
      "name": "Second palette option",
      "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex", "muted": "#hex" },
      "mood": "mood",
      "rationale": "rationale"
    },
    {
      "name": "Third palette option",
      "colors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex", "muted": "#hex" },
      "mood": "mood",
      "rationale": "rationale"
    }
  ],
  "font_pairings": [
    {
      "name": "Pairing name (e.g., 'Modern Professional')",
      "heading": "Google Font family name for headings",
      "body": "Google Font family name for body text",
      "caption": "Google Font family name for captions/small text (optional, can match body)",
      "rationale": "Why this combination works: readability, personality, contrast, etc."
    },
    {
      "name": "Second pairing",
      "heading": "Font",
      "body": "Font",
      "rationale": "rationale"
    },
    {
      "name": "Third pairing",
      "heading": "Font",
      "body": "Font",
      "rationale": "rationale"
    }
  ],
  "voice": {
    "tone": "Primary tone descriptor (e.g., 'Confident & Approachable')",
    "personality": "2-3 sentence description of the brand's personality and how it communicates",
    "sample_copy": "A sample paragraph of brand copy (3-4 sentences) written in this voice. Use the actual brand name.",
    "do_list": [
      "Voice guideline: what to do 1",
      "Voice guideline: what to do 2",
      "Voice guideline: what to do 3",
      "Voice guideline: what to do 4",
      "Voice guideline: what to do 5"
    ],
    "dont_list": [
      "Voice guideline: what to avoid 1",
      "Voice guideline: what to avoid 2",
      "Voice guideline: what to avoid 3",
      "Voice guideline: what to avoid 4",
      "Voice guideline: what to avoid 5"
    ]
  },
  "style_directions": [
    {
      "name": "Style direction name (e.g., 'Minimalist Tech')",
      "description": "2-3 sentences describing the visual direction: imagery style, layout approach, graphic elements, overall aesthetic.",
      "visual_elements": ["element 1", "element 2", "element 3", "element 4"],
      "mood_board_prompt": "A detailed text prompt that could be used to generate a mood board image representing this style direction. Be specific about imagery, textures, colors, and composition."
    },
    {
      "name": "Second style direction",
      "description": "description",
      "visual_elements": ["element 1", "element 2", "element 3"],
      "mood_board_prompt": "prompt"
    },
    {
      "name": "Third style direction",
      "description": "description",
      "visual_elements": ["element 1", "element 2", "element 3"],
      "mood_board_prompt": "prompt"
    }
  ],
  "logo_concepts": [
    {
      "name": "Logo concept name",
      "description": "Detailed description of the logo concept: symbolism, shape language, typography treatment",
      "style": "wordmark | lettermark | icon | combination | emblem",
      "imagen_prompt": "A detailed prompt for generating this logo concept via AI image generation. Describe the logo on a clean white background, specifying style, colors, and composition. Use flat vector style."
    },
    {
      "name": "Second logo concept",
      "description": "description",
      "style": "style",
      "imagen_prompt": "prompt"
    },
    {
      "name": "Third logo concept",
      "description": "description",
      "style": "style",
      "imagen_prompt": "prompt"
    }
  ]
}

Guidelines:
- Each palette should feel distinctly different (e.g., bold vs. muted vs. warm)
- Font pairings should use Google Fonts for web compatibility
- The voice guide should be immediately actionable for copywriters
- Style directions should be diverse enough to represent different creative paths
- Logo concept imagen_prompts should be optimized for AI image generation (flat, vector, clean background)
- Make every option feel premium and professional, never generic

Respond with ONLY the JSON object, no additional text.`;
}
