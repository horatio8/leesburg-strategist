import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { oppositions, entityType, campaignName, location, goal } = await req.json();

    if (!oppositions || !Array.isArray(oppositions) || oppositions.length === 0) {
      return NextResponse.json(
        { error: "No oppositions provided" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are a senior political opposition research analyst. You produce concise, actionable intelligence on political opponents, competing PACs, or rival organizations. Be specific with data points when available and flag estimates. Use a professional, direct tone.`;

    const oppositionList = oppositions
      .map((opp: { name: string; website?: string }, i: number) => {
        const websitePart = opp.website ? ` (Website: ${opp.website})` : "";
        return `${i + 1}. ${opp.name}${websitePart}`;
      })
      .join("\n");

    const userPrompt = `Research the following opposition entities for a ${entityType} campaign:

Campaign: ${campaignName}
Location: ${location}
Goal: ${goal}

Opposition to research:
${oppositionList}

For EACH opposition entity, produce a comprehensive research brief covering:
- Background and bio (who they are, career history, current role)
- Political positions and voting record (if applicable)
- Key vulnerabilities and weaknesses (scandals, controversies, unpopular positions, flip-flops)
- Public perception and media presence
- Fundraising and support base
- Strategic assessment (how they could be challenged)

Return your findings as a JSON array (no markdown, no code fences, just raw JSON):

[
  {
    "oppositionId": "the id from the input",
    "oppositionName": "their name",
    "content": "A 3-5 paragraph comprehensive opposition research brief covering all the areas above."
  }
]

The oppositions and their IDs are:
${oppositions.map((opp: { id: string; name: string }) => `- ID: "${opp.id}", Name: "${opp.name}"`).join("\n")}`;

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

    let parsed;
    try {
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      console.error("Raw response (first 500 chars):", textContent.text.substring(0, 500));
      throw new Error(
        `Failed to parse AI response as JSON. Raw start: ${textContent.text.substring(0, 200)}`
      );
    }

    const research = parsed.map((item: { oppositionId: string; oppositionName: string; content: string }) => ({
      oppositionId: item.oppositionId,
      oppositionName: item.oppositionName,
      content: item.content,
      isEditing: false,
    }));

    return NextResponse.json({ research });
  } catch (error: unknown) {
    console.error("Opposition research API error:", error);
    const message =
      error instanceof Error ? error.message : "Opposition research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
