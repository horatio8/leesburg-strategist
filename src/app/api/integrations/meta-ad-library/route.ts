import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { searchMetaAds, summarizeAdData } from "@/lib/services/meta-ad-library";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const searchTerms = searchParams.get("q");

  if (!searchTerms) {
    return NextResponse.json(
      { error: "Search terms (q) required" },
      { status: 400 }
    );
  }

  try {
    const results = await searchMetaAds({
      search_terms: searchTerms,
      ad_active_status:
        (searchParams.get("status") as "ALL" | "ACTIVE" | "INACTIVE") || "ALL",
      limit: parseInt(searchParams.get("limit") || "25"),
    });

    const summary = summarizeAdData(results.data);

    return NextResponse.json({
      ads: results.data,
      summary,
      total: results.data.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ad Library search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
