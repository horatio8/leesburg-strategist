"use client";

import {
  Globe,
  Users,
  Target,
  TrendingUp,
  Search,
  BarChart3,
  Lightbulb,
  Shield,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import type { CampaignResearch } from "@/lib/types";

interface ResearchReportProps {
  research: CampaignResearch[];
}

export default function ResearchReport({ research }: ResearchReportProps) {
  if (research.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Search className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground mb-1">
          No research yet
        </h2>
        <p className="text-sm text-muted-foreground">
          Run the research agent to generate market intelligence.
        </p>
      </div>
    );
  }

  // Separate research by type
  const marketResearch = research.find((r) => r.type === "social_audit");
  const competitorEntries = research.filter((r) => r.type === "competitor");
  const adLibraryEntry = research.find((r) => r.type === "ad_library");
  const recommendationsEntry = research.find((r) => r.type === "sentiment");

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      {marketResearch?.data && (
        <>
          <MarketOverviewSection data={marketResearch.data} />
          <AudienceSection data={marketResearch.data} />
          <SocialAuditSection data={marketResearch.data} />
          <SEOSection data={marketResearch.data} />
          <BrandPerceptionSection data={marketResearch.data} />
        </>
      )}

      {/* Competitor Analysis */}
      {competitorEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Competitor Analysis
          </h2>
          <div className="space-y-3">
            {competitorEntries.map((entry) => (
              <CompetitorCard
                key={entry.id}
                name={entry.competitor_name || "Unknown"}
                data={entry.data}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ad Library Data */}
      {adLibraryEntry?.data && (
        <AdLibrarySection data={adLibraryEntry.data} />
      )}

      {/* Strategic Recommendations */}
      {recommendationsEntry?.data && (
        <RecommendationsSection data={recommendationsEntry.data} />
      )}
    </div>
  );
}

// ── Section Components ──────────────────────────────────────

function MarketOverviewSection({ data }: { data: Record<string, unknown> }) {
  const overview = data.market_overview as Record<string, unknown> | undefined;
  if (!overview) return null;

  return (
    <CollapsibleSection
      icon={<Globe className="w-5 h-5 text-blue-400" />}
      title="Market Overview"
      defaultOpen
    >
      {!!overview.summary && (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {String(overview.summary)}
        </p>
      )}
      {!!overview.market_size && (
        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">
            Market Size:
          </span>
          <p className="text-sm text-foreground">{String(overview.market_size)}</p>
        </div>
      )}
      {Array.isArray(overview.key_trends) && overview.key_trends.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground mb-2 block">
            Key Trends
          </span>
          <div className="flex flex-wrap gap-2">
            {overview.key_trends.map((trend: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full"
              >
                {trend}
              </span>
            ))}
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

function AudienceSection({ data }: { data: Record<string, unknown> }) {
  const audience = data.audience_insights as Record<string, unknown> | undefined;
  if (!audience) return null;

  return (
    <CollapsibleSection
      icon={<Users className="w-5 h-5 text-purple-400" />}
      title="Audience Insights"
    >
      {!!audience.demographics && (
        <InfoBlock label="Demographics" value={String(audience.demographics)} />
      )}
      {!!audience.psychographics && (
        <InfoBlock label="Psychographics" value={String(audience.psychographics)} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {Array.isArray(audience.pain_points) && (
          <TagList
            label="Pain Points"
            items={audience.pain_points}
            color="text-red-400 bg-red-500/10"
          />
        )}
        {Array.isArray(audience.motivations) && (
          <TagList
            label="Motivations"
            items={audience.motivations}
            color="text-green-400 bg-green-500/10"
          />
        )}
      </div>
      {Array.isArray(audience.preferred_channels) && (
        <TagList
          label="Preferred Channels"
          items={audience.preferred_channels}
          color="text-blue-400 bg-blue-500/10"
          className="mt-3"
        />
      )}
    </CollapsibleSection>
  );
}

function SocialAuditSection({ data }: { data: Record<string, unknown> }) {
  const social = data.social_audit as Record<string, unknown> | undefined;
  if (!social) return null;

  return (
    <CollapsibleSection
      icon={<BarChart3 className="w-5 h-5 text-cyan-400" />}
      title="Social Media Audit"
    >
      {!!social.brand_presence && (
        <InfoBlock label="Brand Presence" value={String(social.brand_presence)} />
      )}
      {!!social.engagement_benchmarks && (
        <InfoBlock
          label="Engagement Benchmarks"
          value={String(social.engagement_benchmarks)}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {Array.isArray(social.content_gaps) && (
          <TagList
            label="Content Gaps"
            items={social.content_gaps}
            color="text-amber-400 bg-amber-500/10"
          />
        )}
        {Array.isArray(social.opportunities) && (
          <TagList
            label="Opportunities"
            items={social.opportunities}
            color="text-emerald-400 bg-emerald-500/10"
          />
        )}
      </div>
    </CollapsibleSection>
  );
}

function SEOSection({ data }: { data: Record<string, unknown> }) {
  const seo = data.seo_landscape as Record<string, unknown> | undefined;
  if (!seo) return null;

  return (
    <CollapsibleSection
      icon={<TrendingUp className="w-5 h-5 text-orange-400" />}
      title="SEO Landscape"
    >
      {Array.isArray(seo.key_terms) && (
        <TagList
          label="Key Search Terms"
          items={seo.key_terms}
          color="text-orange-400 bg-orange-500/10"
        />
      )}
      {!!seo.content_opportunities && (
        <InfoBlock
          label="Content Opportunities"
          value={String(seo.content_opportunities)}
          className="mt-3"
        />
      )}
      {!!seo.competitor_seo_strengths && (
        <InfoBlock
          label="Competitor SEO Strengths"
          value={String(seo.competitor_seo_strengths)}
          className="mt-3"
        />
      )}
    </CollapsibleSection>
  );
}

function BrandPerceptionSection({ data }: { data: Record<string, unknown> }) {
  const perception = data.brand_perception as Record<string, unknown> | undefined;
  if (!perception) return null;

  return (
    <CollapsibleSection
      icon={<Shield className="w-5 h-5 text-indigo-400" />}
      title="Brand Perception"
    >
      {!!perception.current_positioning && (
        <InfoBlock
          label="Current Positioning"
          value={String(perception.current_positioning)}
        />
      )}
      {!!perception.sentiment && (
        <InfoBlock label="Sentiment" value={String(perception.sentiment)} className="mt-3" />
      )}
      {Array.isArray(perception.differentiation_opportunities) && (
        <TagList
          label="Differentiation Opportunities"
          items={perception.differentiation_opportunities}
          color="text-indigo-400 bg-indigo-500/10"
          className="mt-3"
        />
      )}
    </CollapsibleSection>
  );
}

function CompetitorCard({
  name,
  data,
}: {
  name: string;
  data: Record<string, unknown>;
}) {
  return (
    <CollapsibleSection
      icon={<Target className="w-4 h-4 text-red-400" />}
      title={name}
      size="sm"
    >
      {!!data.positioning && (
        <InfoBlock label="Positioning" value={String(data.positioning)} />
      )}
      {!!data.ad_strategy && (
        <InfoBlock label="Ad Strategy" value={String(data.ad_strategy)} className="mt-3" />
      )}
      {!!data.visual_style && (
        <InfoBlock label="Visual Style" value={String(data.visual_style)} className="mt-3" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        {Array.isArray(data.strengths) && (
          <TagList
            label="Strengths"
            items={data.strengths}
            color="text-green-400 bg-green-500/10"
          />
        )}
        {Array.isArray(data.weaknesses) && (
          <TagList
            label="Weaknesses"
            items={data.weaknesses}
            color="text-red-400 bg-red-500/10"
          />
        )}
      </div>
      {Array.isArray(data.messaging_themes) && (
        <TagList
          label="Messaging Themes"
          items={data.messaging_themes}
          color="text-blue-400 bg-blue-500/10"
          className="mt-3"
        />
      )}
    </CollapsibleSection>
  );
}

function AdLibrarySection({ data }: { data: Record<string, unknown> }) {
  return (
    <CollapsibleSection
      icon={<ExternalLink className="w-5 h-5 text-blue-400" />}
      title="Ad Library Data"
    >
      <div className="space-y-4">
        {Object.entries(data).map(([competitor, adData]) => {
          const ad = adData as Record<string, unknown>;
          return (
            <div
              key={competitor}
              className="p-3 bg-muted/30 rounded-lg"
            >
              <h4 className="text-sm font-medium text-foreground mb-2">
                {competitor}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Total Ads</span>
                  <p className="font-medium text-foreground">
                    {String(ad.total_ads ?? "N/A")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Active Ads</span>
                  <p className="font-medium text-foreground">
                    {String(ad.active_ads ?? "N/A")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Platforms</span>
                  <p className="font-medium text-foreground">
                    {Array.isArray(ad.platforms)
                      ? ad.platforms.join(", ")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Spend</span>
                  <p className="font-medium text-foreground">
                    {String(ad.spend_range ?? "N/A")}
                  </p>
                </div>
              </div>
              {Array.isArray(ad.sample_headlines) &&
                ad.sample_headlines.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">
                      Sample Headlines:
                    </span>
                    <ul className="mt-1 space-y-1">
                      {ad.sample_headlines.map((h: string, i: number) => (
                        <li
                          key={i}
                          className="text-xs text-foreground/80 italic"
                        >
                          &ldquo;{h}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </CollapsibleSection>
  );
}

function RecommendationsSection({
  data,
}: {
  data: Record<string, unknown>;
}) {
  const recs = data.recommendations as
    | Array<Record<string, unknown>>
    | undefined;
  if (!recs?.length) return null;

  const priorityColor: Record<string, string> = {
    high: "text-red-400 bg-red-500/10 border-red-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    low: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <CollapsibleSection
      icon={<Lightbulb className="w-5 h-5 text-yellow-400" />}
      title="Strategic Recommendations"
      defaultOpen
    >
      <div className="space-y-3">
        {recs.map((rec, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border ${priorityColor[String(rec.priority)] || priorityColor.medium}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase">
                {String(rec.area)}
              </span>
              <span className="text-xs font-medium uppercase">
                {String(rec.priority)} priority
              </span>
            </div>
            <p className="text-sm text-foreground font-medium">
              {String(rec.recommendation)}
            </p>
            {!!rec.rationale && (
              <p className="text-xs text-muted-foreground mt-1">
                {String(rec.rationale)}
              </p>
            )}
          </div>
        ))}
      </div>

      {!!data.confidence_assessment && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <span className="text-xs font-medium text-muted-foreground">
            Confidence:{" "}
            {String(
              (data.confidence_assessment as Record<string, unknown>)?.overall
            )}
          </span>
          {!!(data.confidence_assessment as Record<string, unknown>)?.notes && (
            <p className="text-xs text-muted-foreground mt-1">
              {String(
                (data.confidence_assessment as Record<string, unknown>).notes
              )}
            </p>
          )}
        </div>
      )}
    </CollapsibleSection>
  );
}

// ── Shared Helpers ──────────────────────────────────────────

function CollapsibleSection({
  icon,
  title,
  children,
  defaultOpen = false,
  size = "lg",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  size?: "sm" | "lg";
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        {icon}
        <span
          className={`font-semibold text-foreground flex-1 ${size === "sm" ? "text-sm" : "text-base"}`}
        >
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-xs font-medium text-muted-foreground block mb-1">
        {label}
      </span>
      <p className="text-sm text-foreground/90 whitespace-pre-line">{value}</p>
    </div>
  );
}

function TagList({
  label,
  items,
  color,
  className = "",
}: {
  label: string;
  items: string[];
  color: string;
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <div className={className}>
      <span className="text-xs font-medium text-muted-foreground block mb-1.5">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className={`px-2 py-0.5 text-xs rounded-full ${color}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
