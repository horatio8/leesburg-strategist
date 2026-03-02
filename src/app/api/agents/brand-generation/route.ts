import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  BRAND_GENERATION_AGENT_CONFIG,
  buildGenerationSystemPrompt,
  buildGenerationUserPrompt,
} from "@/lib/agents/brand-generation-agent";
import {
  createJob,
  startJob,
  completeJob,
  failJob,
} from "@/lib/services/job-runner";
import { generateImage } from "@/lib/services/imagen";

export const maxDuration = 60; // Vercel Hobby plan limit

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const {
    brand_kit_id,
    org_id,
    brand_name,
    industry,
    target_audience,
    personality_traits,
  } = await req.json();

  if (!brand_kit_id || !org_id || !brand_name || !industry) {
    return NextResponse.json(
      {
        error:
          "brand_kit_id, org_id, brand_name, and industry are required",
      },
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
      type: "brand_generation",
      input: {
        brand_kit_id,
        brand_name,
        industry,
        target_audience,
        personality_traits,
      },
      started_by: user.id,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create job" },
      { status: 500 }
    );
  }

  const jobId = job.id;

  // Run generation in the same request
  try {
    await startJob(admin, jobId);

    // 1. Run brand generation agent
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: BRAND_GENERATION_AGENT_CONFIG.model,
      max_tokens: BRAND_GENERATION_AGENT_CONFIG.maxTokens,
      system: buildGenerationSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildGenerationUserPrompt({
            brand_name,
            industry,
            target_audience: target_audience || "General audience",
            personality_traits: personality_traits || [],
          }),
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

    // 2. Generate logo images via Imagen 3 (if concepts have prompts)
    const logoConceptsWithImages = [];
    if (parsed.logo_concepts?.length) {
      for (const concept of parsed.logo_concepts) {
        let imageData = { base64: "", mime_type: "image/png" };
        if (concept.imagen_prompt) {
          try {
            const result = await generateImage({
              prompt: concept.imagen_prompt,
              aspect_ratio: "1:1",
              number_of_images: 1,
            });
            if (result.images?.[0]?.base64) {
              imageData = result.images[0];
            }
          } catch (imgErr) {
            console.warn(
              `Logo image generation failed for "${concept.name}":`,
              imgErr
            );
          }
        }
        logoConceptsWithImages.push({
          ...concept,
          image_base64: imageData.base64 || undefined,
        });
      }
    }

    // 3. Store all options as brand_kit_options rows
    const optionEntries = [];

    // Palette options
    if (parsed.palettes?.length) {
      for (const palette of parsed.palettes) {
        optionEntries.push({
          brand_kit_id,
          type: "generation",
          category: "palette",
          data: palette,
          selected: false,
        });
      }
    }

    // Font pairing options
    if (parsed.font_pairings?.length) {
      for (const pairing of parsed.font_pairings) {
        optionEntries.push({
          brand_kit_id,
          type: "generation",
          category: "font_pairing",
          data: pairing,
          selected: false,
        });
      }
    }

    // Voice guide (single option)
    if (parsed.voice) {
      optionEntries.push({
        brand_kit_id,
        type: "generation",
        category: "voice",
        data: parsed.voice,
        selected: false,
      });
    }

    // Style direction options
    if (parsed.style_directions?.length) {
      for (const style of parsed.style_directions) {
        optionEntries.push({
          brand_kit_id,
          type: "generation",
          category: "style_direction",
          data: style,
          selected: false,
        });
      }
    }

    // Logo concept options (with generated images)
    if (logoConceptsWithImages.length) {
      for (const logo of logoConceptsWithImages) {
        optionEntries.push({
          brand_kit_id,
          type: "generation",
          category: "logo",
          data: {
            name: logo.name,
            description: logo.description,
            style: logo.style,
            image_base64: logo.image_base64 || undefined,
          },
          selected: false,
        });
      }
    }

    const { error: insertError } = await admin
      .from("brand_kit_options")
      .insert(optionEntries);

    if (insertError) {
      throw new Error(
        `Failed to store generation options: ${insertError.message}`
      );
    }

    // 4. Update brand kit source and name
    await admin
      .from("brand_kits")
      .update({
        source: "generated",
        name: brand_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", brand_kit_id);

    // 5. Complete the job
    await completeJob(admin, jobId, {
      options_created: optionEntries.length,
      palettes: parsed.palettes?.length || 0,
      font_pairings: parsed.font_pairings?.length || 0,
      logo_concepts: logoConceptsWithImages.length,
      logos_with_images: logoConceptsWithImages.filter(
        (l) => l.image_base64
      ).length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Brand generation failed";
    console.error("Brand generation agent error:", error);
    await failJob(admin, jobId, message);
  }

  return NextResponse.json({ jobId });
}
