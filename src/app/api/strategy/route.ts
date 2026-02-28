import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ResearchSection, StrategyTile, QuadrantKey } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { researchInput, researchSections } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const researchContext = (researchSections as ResearchSection[])
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    const systemPrompt = `Act as a Lead Political Strategist. You are building a Leesburg Grid — a 2x2 messaging matrix used in political campaigns. The four quadrants are:

1. "Our Story" — What we say about ourselves (positive self-messaging)
2. "The Attack" — What we say about them (offensive messaging against opponents)
3. "Their Defense" — What they say about themselves (opponent's likely positive messaging)
4. "The Counter" — What they say about us (opponent's likely attacks on us)

CRITICAL RULES:
- Every point in "Our Story" must have a logical counter-punch in "The Counter"
- Every attack we level at them must be met with their likely defense
- Each angle should be a concise 1-2 sentence messaging point
- Be specific to the research provided, not generic
- Make them punchy, memorable, and strategically sound`;

    const userPrompt = `Using the following research, generate a Leesburg Grid with exactly 9 strategy angles per quadrant (36 total).

ENTITY: ${researchInput.name} (${researchInput.entityType})
LOCATION: ${researchInput.location}
GOAL: ${researchInput.goal}

RESEARCH:
${researchContext}

Return your response as raw JSON (no markdown, no code fences):

{
  "our-story": ["angle 1", "angle 2", ..., "angle 9"],
  "the-attack": ["angle 1", "angle 2", ..., "angle 9"],
  "their-defense": ["angle 1", "angle 2", ..., "angle 9"],
  "the-counter": ["angle 1", "angle 2", ..., "angle 9"]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    let parsed: Record<string, string[]>;
    try {
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      return NextResponse.json(
        { error: "Failed to parse strategy response" },
        { status: 500 }
      );
    }

    // Convert to StrategyTile format
    const wells: Record<QuadrantKey, StrategyTile[]> = {
      "our-story": [],
      "the-attack": [],
      "their-defense": [],
      "the-counter": [],
    };

    for (const key of Object.keys(wells) as QuadrantKey[]) {
      const angles = parsed[key] || [];
      wells[key] = angles.slice(0, 9).map((text, i) => ({
        id: `${key}-${i}`,
        text,
        quadrant: key,
        isCustom: false,
      }));
    }

    return NextResponse.json({ wells });
  } catch (error: unknown) {
    console.error("Strategy API error:", error);
    const message =
      error instanceof Error ? error.message : "Strategy generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
