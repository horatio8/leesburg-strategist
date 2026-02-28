import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { entityType, name, location, goal } = await req.json();

    if (!name || !location || !goal) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are a senior political research analyst. You produce concise, actionable intelligence briefs for political strategists. Be specific with real data points when available, and clearly flag any estimates or general assessments. Use a professional, direct tone.`;

    const userPrompt = `Research the following political entity and produce a comprehensive intelligence brief:

Entity Type: ${entityType}
Name: ${name}
Location/District: ${location}
Strategic Goal: ${goal}

Produce your findings in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):

{
  "geographic": "A 2-3 paragraph profile of the district/area including demographics, political leanings, urban/rural mix, key economic drivers, and the general 'vibe' or culture of the area.",
  "electoral": "A 2-3 paragraph analysis of recent election margins, voter turnout trends, registration numbers by party, and estimated 'win numbers' (votes needed to win). Include specific percentages and numbers where possible.",
  "incumbent": "A 2-3 paragraph audit of the current incumbent or primary opponent including their record, voting history, known vulnerabilities, public perception, approval ratings, and any notable positions.",
  "issues": "A 2-3 paragraph summary of the top 3-5 trending local concerns. What are voters talking about? What issues drive turnout in this area? Include any relevant polling data.",
  "context": "A 2-3 paragraph overview of the current strategic landscape including recent news, scandals, endorsements, fundraising dynamics, or external events that could affect the race."
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

    // Parse the JSON response
    let parsed;
    try {
      // Try to extract JSON from the response (handle possible markdown wrapping)
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // If parsing fails, create sections from the raw text
      parsed = {
        geographic:
          "Research data is being compiled. Please edit this section with your own findings.",
        electoral:
          "Research data is being compiled. Please edit this section with your own findings.",
        incumbent:
          "Research data is being compiled. Please edit this section with your own findings.",
        issues:
          "Research data is being compiled. Please edit this section with your own findings.",
        context:
          "Research data is being compiled. Please edit this section with your own findings.",
      };
    }

    const sections = [
      {
        id: "geographic",
        title: "Geographic Profile",
        icon: "MapPin",
        content: parsed.geographic,
        isEditing: false,
      },
      {
        id: "electoral",
        title: "Electoral Data",
        icon: "BarChart3",
        content: parsed.electoral,
        isEditing: false,
      },
      {
        id: "incumbent",
        title: "Incumbent Audit",
        icon: "UserSearch",
        content: parsed.incumbent,
        isEditing: false,
      },
      {
        id: "issues",
        title: "Issue Pulse",
        icon: "TrendingUp",
        content: parsed.issues,
        isEditing: false,
      },
      {
        id: "context",
        title: "Strategic Context",
        icon: "Newspaper",
        content: parsed.context,
        isEditing: false,
      },
    ];

    return NextResponse.json({ sections });
  } catch (error: unknown) {
    console.error("Research API error:", error);
    const message =
      error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
