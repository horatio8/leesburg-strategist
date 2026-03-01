import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");

  if (!q) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 }
    );
  }

  try {
    // Query Nominatim for the district boundary polygon
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      q
    )}&format=json&polygon_geojson=1&limit=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "CampaignInstitute/1.0 (political-strategy-tool)",
      },
      // Cache for 24 hours since district boundaries don't change often
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      throw new Error(`Nominatim API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.length > 0 && data[0].geojson) {
      const result = data[0];

      // Wrap the geometry in a GeoJSON Feature for Leaflet compatibility
      const feature = {
        type: "Feature" as const,
        geometry: result.geojson,
        properties: {
          name: result.display_name,
          type: result.type,
          class: result.class,
        },
      };

      return NextResponse.json({
        geojson: feature,
        boundingbox: result.boundingbox,
        displayName: result.display_name,
      });
    }

    // If no polygon found, try a broader search without polygon to get at least coordinates
    return NextResponse.json({ geojson: null });
  } catch (error) {
    console.error("District boundary fetch error:", error);
    return NextResponse.json({ geojson: null });
  }
}
