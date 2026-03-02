/**
 * Meta Ad Library API wrapper.
 *
 * The Meta Ad Library API requires a Facebook app with Ads Library access.
 * Endpoint: https://graph.facebook.com/v21.0/ads_archive
 *
 * Required env vars:
 * - META_AD_LIBRARY_ACCESS_TOKEN: Long-lived page access token
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/reference/ads_archive/
 */

export interface MetaAdSearchParams {
  search_terms: string;
  ad_type?: "ALL" | "POLITICAL_AND_ISSUE_ADS";
  ad_reached_countries?: string[]; // ISO country codes
  ad_active_status?: "ALL" | "ACTIVE" | "INACTIVE";
  search_page_ids?: string[];
  limit?: number;
}

export interface MetaAdResult {
  id: string;
  ad_creative_bodies?: string[];
  ad_creative_link_captions?: string[];
  ad_creative_link_descriptions?: string[];
  ad_creative_link_titles?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  page_id?: string;
  page_name?: string;
  publisher_platforms?: string[];
  estimated_audience_size?: {
    lower_bound: number;
    upper_bound: number;
  };
  spend?: {
    lower_bound: string;
    upper_bound: string;
  };
  impressions?: {
    lower_bound: string;
    upper_bound: string;
  };
}

export interface MetaAdLibraryResponse {
  data: MetaAdResult[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

const META_GRAPH_URL = "https://graph.facebook.com/v21.0/ads_archive";

export async function searchMetaAds(
  params: MetaAdSearchParams
): Promise<MetaAdLibraryResponse> {
  const token = process.env.META_AD_LIBRARY_ACCESS_TOKEN;

  if (!token) {
    // Return empty result when API is not configured
    return { data: [] };
  }

  const searchParams = new URLSearchParams({
    access_token: token,
    search_terms: params.search_terms,
    ad_type: params.ad_type || "ALL",
    ad_reached_countries: JSON.stringify(
      params.ad_reached_countries || ["US"]
    ),
    ad_active_status: params.ad_active_status || "ALL",
    fields: [
      "id",
      "ad_creative_bodies",
      "ad_creative_link_captions",
      "ad_creative_link_descriptions",
      "ad_creative_link_titles",
      "ad_delivery_start_time",
      "ad_delivery_stop_time",
      "page_id",
      "page_name",
      "publisher_platforms",
      "estimated_audience_size",
      "spend",
      "impressions",
    ].join(","),
    limit: String(params.limit || 25),
  });

  if (params.search_page_ids?.length) {
    searchParams.set(
      "search_page_ids",
      JSON.stringify(params.search_page_ids)
    );
  }

  const response = await fetch(`${META_GRAPH_URL}?${searchParams}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Meta Ad Library API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Summarize ad library data for inclusion in AI research reports.
 */
export function summarizeAdData(ads: MetaAdResult[]): {
  total_ads: number;
  active_ads: number;
  platforms: string[];
  common_themes: string[];
  sample_headlines: string[];
  spend_range: string | null;
} {
  const now = new Date();
  const activeAds = ads.filter(
    (ad) =>
      !ad.ad_delivery_stop_time ||
      new Date(ad.ad_delivery_stop_time) > now
  );

  const allPlatforms = new Set<string>();
  ads.forEach((ad) =>
    ad.publisher_platforms?.forEach((p) => allPlatforms.add(p))
  );

  const headlines = ads
    .flatMap((ad) => ad.ad_creative_link_titles || [])
    .slice(0, 5);

  // Rough spend range
  let minSpend = Infinity;
  let maxSpend = 0;
  ads.forEach((ad) => {
    if (ad.spend) {
      const low = parseFloat(ad.spend.lower_bound);
      const high = parseFloat(ad.spend.upper_bound);
      if (low < minSpend) minSpend = low;
      if (high > maxSpend) maxSpend = high;
    }
  });

  const spendRange =
    minSpend !== Infinity
      ? `$${minSpend.toLocaleString()} - $${maxSpend.toLocaleString()}`
      : null;

  // Extract common words from ad bodies for theme detection
  const bodyTexts = ads.flatMap((ad) => ad.ad_creative_bodies || []);
  const wordCounts: Record<string, number> = {};
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "it", "this", "that",
    "are", "was", "be", "have", "has", "your", "you", "we", "our",
  ]);
  bodyTexts.forEach((text) => {
    text
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .forEach((word) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
  });
  const commonThemes = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return {
    total_ads: ads.length,
    active_ads: activeAds.length,
    platforms: Array.from(allPlatforms),
    common_themes: commonThemes,
    sample_headlines: headlines,
    spend_range: spendRange,
  };
}
