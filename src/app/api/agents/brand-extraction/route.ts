import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  BRAND_EXTRACTION_AGENT_CONFIG,
  buildExtractionSystemPrompt,
  buildExtractionUserPrompt,
} from "@/lib/agents/brand-extraction-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
} from "@/lib/services/job-runner";

export const maxDuration = 300; // Vercel Pro plan

async function fetchWebsiteHTML(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BrandBot/1.0; +https://leesburg.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    // Truncate to ~50KB to stay within context limits
    return html.slice(0, 50000);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolve and validate high-resolution logo URLs.
 * Tries common high-res logo paths and validates that URLs are reachable.
 * Returns deduplicated list sorted by quality (SVG first, then by size).
 */
async function resolveHighResLogos(
  extractedUrls: string[],
  sourceUrl: string
): Promise<string[]> {
  const baseUrl = new URL(sourceUrl);
  const origin = baseUrl.origin;

  // Generate additional candidate URLs based on common patterns
  const candidates = new Set<string>(extractedUrls);

  // Try common high-res logo paths
  const commonPaths = [
    "/logo.svg",
    "/images/logo.svg",
    "/assets/logo.svg",
    "/img/logo.svg",
    "/favicon.svg",
    "/apple-touch-icon.png",
    "/apple-touch-icon-precomposed.png",
    "/apple-touch-icon-180x180.png",
    "/favicon-192x192.png",
    "/favicon-512x512.png",
  ];

  for (const path of commonPaths) {
    candidates.add(`${origin}${path}`);
  }

  // For each extracted URL, check if an SVG variant exists
  for (const url of extractedUrls) {
    try {
      const parsed = new URL(url);
      const svgVariant = parsed.href.replace(/\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i, ".svg");
      if (svgVariant !== parsed.href) {
        candidates.add(svgVariant);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  // Validate URLs in parallel (HEAD requests with short timeout)
  const validatedUrls: { url: string; contentType: string; size: number }[] = [];

  const checks = Array.from(candidates).map(async (url) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BrandBot/1.0; +https://leesburg.ai)",
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        const contentLength = parseInt(res.headers.get("content-length") || "0", 10);
        // Only accept image types
        if (contentType.includes("image/") || contentType.includes("svg")) {
          return { url, contentType, size: contentLength };
        }
      }
    } catch {
      // URL not reachable, skip
    }
    return null;
  });

  const results = await Promise.all(checks);
  for (const r of results) {
    if (r) validatedUrls.push(r);
  }

  // Sort: SVG first, then by file size (largest first)
  validatedUrls.sort((a, b) => {
    const aIsSvg = a.contentType.includes("svg") ? 1 : 0;
    const bIsSvg = b.contentType.includes("svg") ? 1 : 0;
    if (aIsSvg !== bIsSvg) return bIsSvg - aIsSvg;
    return b.size - a.size;
  });

  // Deduplicate and return up to 5 best logos
  const seen = new Set<string>();
  const finalUrls: string[] = [];
  for (const { url } of validatedUrls) {
    const normalized = url.replace(/\?.*$/, ""); // Normalize by removing query params for dedup
    if (!seen.has(normalized)) {
      seen.add(normalized);
      finalUrls.push(url);
    }
    if (finalUrls.length >= 5) break;
  }

  return finalUrls;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { brand_kit_id, website_url, org_id } = await req.json();

  if (!brand_kit_id || !website_url || !org_id) {
    return NextResponse.json(
      { error: "brand_kit_id, website_url, and org_id are required" },
      { status: 400 }
    );
  }

  // Verify brand kit exists
  const { data: brandKit, error: bkError } = await admin
    .from("brand_kits")
    .select("*")
    .eq("id", brand_kit_id)
    .single();

  if (bkError || !brandKit) {
    return NextResponse.json(
      { error: "Brand kit not found" },
      { status: 404 }
    );
  }

  // Create job
  let job;
  try {
    job = await createJob(admin, {
      org_id,
      type: "brand_extraction",
      input: { brand_kit_id, website_url },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;

  // Run extraction in the same request
  try {
    await startJob(admin, jobId);

    // 1. Fetch website HTML
    let html: string;
    try {
      html = await fetchWebsiteHTML(website_url);
    } catch (fetchErr) {
      throw new Error(
        `Failed to fetch website: ${fetchErr instanceof Error ? fetchErr.message : "Unknown error"}. The site may block automated requests or be unreachable.`
      );
    }

    // 2. Run extraction agent
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: BRAND_EXTRACTION_AGENT_CONFIG.model,
      max_tokens: BRAND_EXTRACTION_AGENT_CONFIG.maxTokens,
      system: buildExtractionSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildExtractionUserPrompt(html, website_url),
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in AI response");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    const parsed = JSON.parse(jsonMatch[0]);

    // 3. Resolve high-definition logo URLs
    const extraction = parsed.extraction;
    let hdLogoUrls: string[] = [];
    try {
      hdLogoUrls = await resolveHighResLogos(
        extraction.logo_urls || [],
        website_url
      );
    } catch (logoErr) {
      console.warn("HD logo resolution failed, using extracted URLs:", logoErr);
      hdLogoUrls = extraction.logo_urls || [];
    }

    // 4. Store extraction as brand_kit_options
    const optionEntries = [];

    // Full extraction result (with HD logo URLs)
    optionEntries.push({
      brand_kit_id,
      type: "extraction",
      category: "full_extraction",
      data: {
        logo_urls: hdLogoUrls,
        colors: extraction.colors || {},
        fonts: extraction.fonts || {},
        voice_analysis: extraction.voice_analysis || "",
        visual_style: extraction.visual_style || "",
        source_url: website_url,
      },
      selected: false,
    });

    // Individual palette option from extraction
    if (extraction.colors && Object.keys(extraction.colors).length > 0) {
      optionEntries.push({
        brand_kit_id,
        type: "extraction",
        category: "palette",
        data: {
          name: "Extracted Palette",
          colors: extraction.colors,
          mood: "From website",
          rationale: `Colors extracted from ${website_url}. Confidence: ${parsed.confidence?.colors || "medium"}.`,
        },
        selected: false,
      });
    }

    // Font pairing from extraction
    if (extraction.fonts && Object.keys(extraction.fonts).length > 0) {
      optionEntries.push({
        brand_kit_id,
        type: "extraction",
        category: "font_pairing",
        data: {
          name: "Extracted Typography",
          heading: extraction.fonts.heading || "",
          body: extraction.fonts.body || "",
          caption: extraction.fonts.caption || "",
          rationale: `Fonts extracted from ${website_url}. Confidence: ${parsed.confidence?.fonts || "medium"}.`,
        },
        selected: false,
      });
    }

    // Voice from extraction
    if (extraction.voice_analysis) {
      optionEntries.push({
        brand_kit_id,
        type: "extraction",
        category: "voice",
        data: {
          tone: "Extracted",
          personality: extraction.voice_analysis,
          sample_copy: "",
          do_list: [],
          dont_list: [],
        },
        selected: false,
      });
    }

    // Style direction from extraction
    if (extraction.visual_style) {
      optionEntries.push({
        brand_kit_id,
        type: "extraction",
        category: "style_direction",
        data: {
          name: "Extracted Style",
          description: extraction.visual_style,
          visual_elements: [],
          mood_board_prompt: "",
        },
        selected: false,
      });
    }

    const { error: insertError } = await admin
      .from("brand_kit_options")
      .insert(optionEntries);

    if (insertError) {
      throw new Error(
        `Failed to store extraction options: ${insertError.message}`
      );
    }

    // 4. Update brand kit source
    await admin
      .from("brand_kits")
      .update({ source: "extracted", updated_at: new Date().toISOString() })
      .eq("id", brand_kit_id);

    // 5. Complete the job
    await completeJob(admin, jobId, {
      options_created: optionEntries.length,
      confidence: parsed.confidence,
      source_url: website_url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Brand extraction failed";
    console.error("Brand extraction agent error:", error);
    await failJob(admin, jobId, message);
  }

  return NextResponse.json({ jobId });
}
