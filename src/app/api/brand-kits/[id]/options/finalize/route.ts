import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type {
  PaletteOption,
  FontPairingOption,
  VoiceOption,
  BrandExtractionResult,
} from "@/lib/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandKitId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();

  // Fetch all selected options for this brand kit
  const { data: selectedOptions, error: fetchError } = await admin
    .from("brand_kit_options")
    .select("*")
    .eq("brand_kit_id", brandKitId)
    .eq("selected", true);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!selectedOptions || selectedOptions.length === 0) {
    return NextResponse.json(
      { error: "No options selected. Please select at least one option before finalizing." },
      { status: 400 }
    );
  }

  // Build the update object from selected options
  const updates: Record<string, unknown> = {
    status: "active",
    updated_at: new Date().toISOString(),
  };

  for (const option of selectedOptions) {
    const data = option.data;

    switch (option.category) {
      case "full_extraction": {
        const extraction = data as BrandExtractionResult;
        if (extraction.colors && Object.keys(extraction.colors).length > 0) {
          updates.colors = extraction.colors;
        }
        if (extraction.fonts && Object.keys(extraction.fonts).length > 0) {
          updates.fonts = extraction.fonts;
        }
        if (extraction.voice_analysis) {
          updates.voice_guide = extraction.voice_analysis;
        }
        if (extraction.logo_urls?.length) {
          updates.logo_urls = extraction.logo_urls;
        }
        break;
      }
      case "palette": {
        const palette = data as PaletteOption;
        if (palette.colors && Object.keys(palette.colors).length > 0) {
          updates.colors = palette.colors;
        }
        break;
      }
      case "font_pairing": {
        const fonts = data as FontPairingOption;
        const fontMap: Record<string, string> = {};
        if (fonts.heading) fontMap.heading = fonts.heading;
        if (fonts.body) fontMap.body = fonts.body;
        if (fonts.caption) fontMap.caption = fonts.caption;
        if (Object.keys(fontMap).length > 0) {
          updates.fonts = fontMap;
        }
        break;
      }
      case "voice": {
        const voice = data as VoiceOption;
        const voiceParts: string[] = [];
        if (voice.tone) voiceParts.push(`Tone: ${voice.tone}`);
        if (voice.personality)
          voiceParts.push(`Personality: ${voice.personality}`);
        if (voice.do_list?.length)
          voiceParts.push(`Do: ${voice.do_list.join("; ")}`);
        if (voice.dont_list?.length)
          voiceParts.push(`Don't: ${voice.dont_list.join("; ")}`);
        if (voice.sample_copy)
          voiceParts.push(`Sample: ${voice.sample_copy}`);
        if (voiceParts.length > 0) {
          updates.voice_guide = voiceParts.join("\n\n");
        }
        break;
      }
      case "logo": {
        // Logo images: store image data URIs in logo_urls
        const logo = data as { image_base64?: string; image_url?: string };
        const existingLogos = (updates.logo_urls as string[]) || [];
        if (logo.image_base64) {
          existingLogos.push(`data:image/png;base64,${logo.image_base64}`);
        } else if (logo.image_url) {
          existingLogos.push(logo.image_url);
        }
        updates.logo_urls = existingLogos;
        break;
      }
      // style_direction doesn't map directly to brand_kit fields
      // but the visual info is captured via the other selections
    }
  }

  // Apply updates to the brand kit
  const { data: updatedKit, error: updateError } = await admin
    .from("brand_kits")
    .update(updates)
    .eq("id", brandKitId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedKit);
}
