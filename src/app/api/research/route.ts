import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { entityType, name, location, goal, website, socialMedia } = await req.json();

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

    // Build optional context sections
    const websiteSection = website ? `\nCampaign Website: ${website} (use this URL to inform your research about their platform, messaging, and public positioning)` : "";

    const socialHandles = socialMedia
      ? Object.entries(socialMedia as Record<string, string>)
          .filter(([, v]) => v && v.trim())
          .map(([platform, handle]) => `  ${platform}: ${handle}`)
          .join("\n")
      : "";
    const socialSection = socialHandles ? `\nSocial Media Presence:\n${socialHandles}\n(Use these social media profiles to inform your research about their public communication style, engagement, and digital strategy)` : "";

    const userPrompt = `Research the following political entity and produce a comprehensive intelligence brief:

Entity Type: ${entityType}
Name: ${name}
Location/District: ${location}
Strategic Goal: ${goal}${websiteSection}${socialSection}

Produce your findings in EXACTLY this JSON format (no markdown, no code fences, just raw JSON):

{
  "geographic": "A 2-3 paragraph profile of the district/area including demographics, political leanings, urban/rural mix, key economic drivers, and the general 'vibe' or culture of the area.",
  "electoral": "A 2-3 paragraph analysis of recent election margins, voter turnout trends, registration numbers by party, and estimated 'win numbers' (votes needed to win). Include specific percentages and numbers where possible.",
  "incumbent": "A 2-3 paragraph audit of the current incumbent or primary opponent including their record, voting history, known vulnerabilities, public perception, approval ratings, and any notable positions.",
  "issues": "A 2-3 paragraph summary of the top 3-5 trending local concerns. What are voters talking about? What issues drive turnout in this area? Include any relevant polling data.",
  "context": "A 2-3 paragraph overview of the current strategic landscape including recent news, scandals, endorsements, fundraising dynamics, or external events that could affect the race.",
  "mapData": {
    "lat": 0.0,
    "lng": 0.0,
    "zoom": 8,
    "boundaryQuery": "A Nominatim/OpenStreetMap search query to find this specific district boundary. Examples: '10th congressional district, Virginia, United States' or 'Virginia State Senate district 31' or 'State of Florida, United States'. Use the most specific boundary query that matches the district level.",
    "label": "A short label for the map, e.g. 'VA-10' or 'Florida Senate District 31'"
  }
}

IMPORTANT for mapData: You MUST provide accurate latitude and longitude coordinates for the CENTER of the district/area. Use real geographic coordinates (lat between -90 and 90, lng between -180 and 180). Set zoom level appropriately: 6 for state-level, 8 for congressional, 9-10 for state legislative, 11 for city/local. The boundaryQuery should be a search string that OpenStreetMap's Nominatim geocoder can resolve to find the district boundary polygon.`;

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
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr);
      console.error("Raw response (first 500 chars):", textContent.text.substring(0, 500));
      throw new Error(
        `Failed to parse AI response as JSON. Raw start: ${textContent.text.substring(0, 200)}`
      );
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

    // Extract map data if available
    const mapData = parsed.mapData && parsed.mapData.lat && parsed.mapData.lng
      ? {
          lat: Number(parsed.mapData.lat),
          lng: Number(parsed.mapData.lng),
          zoom: Number(parsed.mapData.zoom) || 8,
          boundaryQuery: parsed.mapData.boundaryQuery || "",
          label: parsed.mapData.label || "",
        }
      : null;

    return NextResponse.json({ sections, mapData });
  } catch (error: unknown) {
    console.error("Research API error:", error);
    const message =
      error instanceof Error ? error.message : "Research failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
