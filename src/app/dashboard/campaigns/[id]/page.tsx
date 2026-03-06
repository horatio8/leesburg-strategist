"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Trash2,
  Loader2,
  Palette,
  FileText,
  Wand2,
  Sparkles,
  Mail,
  Search,
  Lightbulb,
  Plus,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import JobProgress from "@/components/shared/JobProgress";
import type {
  Campaign,
  Job,
  BrandKit,
  MessagingFramework,
  Creative,
  EmailCampaign,
} from "@/lib/types";

/* ---------- small status badge ---------- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    complete: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    generating: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    reviewing: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
    deployed: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  };
  const cls = map[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${cls}`}
    >
      {status}
    </span>
  );
}

/* ---------- quick-create button ---------- */
function CreateButton({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
    >
      <Icon className="w-4 h-4 text-primary" />
      {label}
    </Link>
  );
}

export default function CampaignOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [campRes, bkRes, fwRes, crRes, ecRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/brand-kits`),
          fetch(`/api/frameworks?campaign_id=${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/creatives`),
          fetch(`/api/email-campaigns?campaign_id=${campaignId}`),
        ]);
        if (campRes.ok) setCampaign(await campRes.json());
        if (bkRes.ok) setBrandKits(await bkRes.json());
        if (fwRes.ok) {
          const d = await fwRes.json();
          setFrameworks(Array.isArray(d) ? d : []);
        }
        if (crRes.ok) {
          const d = await crRes.json();
          setCreatives(Array.isArray(d) ? d : []);
        }
        if (ecRes.ok) {
          const d = await ecRes.json();
          setEmailCampaigns(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const updateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setCampaign(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCampaign = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      });
      if (res.ok) router.push("/dashboard/campaigns");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const nextActions: Record<string, { label: string; status: string }> = {
    draft: { label: "Start Research", status: "researching" },
    researching: { label: "Move to Ideation", status: "ideation" },
    ideation: { label: "Start Creating", status: "creating" },
    creating: { label: "Submit for Review", status: "review" },
    review: { label: "Deploy", status: "deployed" },
    deployed: { label: "Start Monitoring", status: "monitoring" },
    monitoring: { label: "Mark Complete", status: "complete" },
  };
  const next = nextActions[campaign.status];

  /* ---------- categorised lists ---------- */
  const activeBrandKits = brandKits.filter((b) => b.status === "active");
  const completeFrameworks = frameworks.filter(
    (f) => f.status === "complete"
  );

  /* group creatives by platform */
  const creativesByPlatform: Record<string, Creative[]> = {};
  creatives.forEach((c) => {
    const key = c.platform || "other";
    (creativesByPlatform[key] ??= []).push(c);
  });

  const PLATFORM_LABELS: Record<string, string> = {
    meta_feed: "Meta Feed",
    meta_stories: "Meta Stories",
    x: "X / Twitter",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    youtube: "YouTube",
    multi: "Multi-platform",
    other: "Other",
  };

  return (
    <div className="space-y-8">
      {/* ============================================================
          1. CAMPAIGN STATUS & ACTIONS
          ============================================================ */}
      <div className="flex items-center gap-3 flex-wrap">
        {next && (
          <button
            onClick={() => updateStatus(next.status)}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {next.label}
          </button>
        )}
        {campaign.status !== "paused" && campaign.status !== "complete" && (
          <button
            onClick={() => updateStatus("paused")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/20 disabled:opacity-50 transition-colors"
          >
            <Pause className="w-4 h-4" />
            Pause
          </button>
        )}
        {campaign.status === "paused" && (
          <button
            onClick={() => updateStatus("monitoring")}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        )}
        <button
          onClick={deleteCampaign}
          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      {/* ============================================================
          2. QUICK-CREATE BUTTONS
          ============================================================ */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Create New
        </h3>
        <div className="flex flex-wrap gap-2">
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/brand-kits`}
            icon={Palette}
            label="Brand Kit"
          />
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/frameworks`}
            icon={FileText}
            label="Framework"
          />
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/generate`}
            icon={Wand2}
            label="Creative"
          />
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/emails`}
            icon={Mail}
            label="Email Campaign"
          />
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/research`}
            icon={Search}
            label="Research"
          />
          <CreateButton
            href={`/dashboard/campaigns/${campaignId}/strategy`}
            icon={Lightbulb}
            label="Strategy"
          />
        </div>
      </div>

      {/* ============================================================
          3. ACTIVE JOBS
          ============================================================ */}
      {jobs.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Jobs
          </h3>
          {jobs.map((job) => (
            <JobProgress key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* ============================================================
          4. CATEGORISED ASSET LISTS
          ============================================================ */}
      <div className="space-y-6">

        {/* ---- Brand Kits ---- */}
        <AssetSection
          title="Brand Kits"
          icon={Palette}
          count={brandKits.length}
          href={`/dashboard/campaigns/${campaignId}/brand-kits`}
        >
          {brandKits.length === 0 ? (
            <EmptyHint label="No brand kits yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {brandKits.map((kit) => {
                const colorValues = Object.values(kit.colors || {});
                return (
                  <Link
                    key={kit.id}
                    href={`/dashboard/campaigns/${campaignId}/brand-kits`}
                    className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                  >
                    {colorValues.length > 0 && (
                      <div className="flex rounded overflow-hidden h-3 mb-2 border border-border">
                        {colorValues.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className="flex-1"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {kit.name}
                      </span>
                      <StatusBadge status={kit.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </AssetSection>

        {/* ---- Messaging Frameworks ---- */}
        <AssetSection
          title="Messaging Frameworks"
          icon={FileText}
          count={frameworks.length}
          href={`/dashboard/campaigns/${campaignId}/frameworks`}
        >
          {frameworks.length === 0 ? (
            <EmptyHint label="No frameworks yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {frameworks.map((fw) => {
                const tileCount = Object.values(fw.grid || {}).reduce(
                  (sum, tiles) =>
                    sum + (Array.isArray(tiles) ? tiles.length : 0),
                  0
                );
                return (
                  <Link
                    key={fw.id}
                    href={`/dashboard/campaigns/${campaignId}/frameworks`}
                    className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {fw.title}
                      </span>
                      <StatusBadge status={fw.status} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {fw.entity_type} &middot; {tileCount} tiles
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </AssetSection>

        {/* ---- Creatives ---- */}
        <AssetSection
          title="Creative Assets"
          icon={Sparkles}
          count={creatives.length}
          href={`/dashboard/campaigns/${campaignId}/creative`}
        >
          {creatives.length === 0 ? (
            <EmptyHint label="No creatives yet" />
          ) : (
            <div className="space-y-3">
              {Object.entries(creativesByPlatform).map(([platform, items]) => (
                <div key={platform}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {PLATFORM_LABELS[platform] || platform}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {items.slice(0, 6).map((c) => {
                      const headline =
                        (c.content as Record<string, string>)?.headline ||
                        (c.content as Record<string, string>)?.primary_text?.slice(0, 50) ||
                        c.type;
                      return (
                        <Link
                          key={c.id}
                          href={`/dashboard/campaigns/${campaignId}/creative`}
                          className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-sm font-medium text-foreground truncate">
                              {headline}
                            </span>
                            <StatusBadge status={c.status} />
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {c.type}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                  {items.length > 6 && (
                    <Link
                      href={`/dashboard/campaigns/${campaignId}/creative`}
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      +{items.length - 6} more
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </AssetSection>

        {/* ---- Email Campaigns ---- */}
        <AssetSection
          title="Email Campaigns"
          icon={Mail}
          count={emailCampaigns.length}
          href={`/dashboard/campaigns/${campaignId}/emails`}
        >
          {emailCampaigns.length === 0 ? (
            <EmptyHint label="No email campaigns yet" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emailCampaigns.map((ec) => (
                <Link
                  key={ec.id}
                  href={`/dashboard/campaigns/${campaignId}/emails/${ec.id}`}
                  className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {ec.name}
                    </span>
                    <StatusBadge status={ec.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {ec.brief?.total_emails && (
                      <span>
                        {ec.brief.total_emails} emails
                      </span>
                    )}
                    {ec.brief?.frequency && (
                      <span>{ec.brief.frequency}</span>
                    )}
                    {ec.brief?.start_date && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(ec.brief.start_date + "T00:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AssetSection>
      </div>

      {/* ============================================================
          5. CAMPAIGN BRIEF
          ============================================================ */}
      {campaign.brief && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Campaign Brief
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {campaign.brief.target_audience && (
              <div>
                <span className="text-muted-foreground">Audience:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.target_audience}
                </span>
              </div>
            )}
            {campaign.brief.goals && (
              <div>
                <span className="text-muted-foreground">Goals:</span>{" "}
                <span className="text-foreground">{campaign.brief.goals}</span>
              </div>
            )}
            {campaign.brief.budget_range && (
              <div>
                <span className="text-muted-foreground">Budget:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.budget_range}
                </span>
              </div>
            )}
            {campaign.brief.website && (
              <div>
                <span className="text-muted-foreground">Website:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.website}
                </span>
              </div>
            )}
          </div>

          {campaign.brief.brand_voice_notes && (
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Brand Voice Notes
              </span>
              <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">
                {campaign.brief.brand_voice_notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* =================================================================
   Helper components
   ================================================================= */

function AssetSection({
  title,
  icon: Icon,
  count,
  href,
  children,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyHint({ label }: { label: string }) {
  return (
    <div className="bg-card border border-dashed border-border rounded-lg p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
