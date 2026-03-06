"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Pause,
  CheckCircle2,
  Trash2,
  Globe,
  Users,
  Target,
  DollarSign,
  Loader2,
  Palette,
  FileText,
  Wand2,
  CheckCircle,
  Circle,
} from "lucide-react";
import Link from "next/link";
import JobProgress from "@/components/shared/JobProgress";
import type { Campaign, Job, BrandKit, MessagingFramework } from "@/lib/types";

const PLATFORM_LABELS: Record<string, string> = {
  meta_feed: "Meta (Feed)",
  meta_stories: "Meta (Stories)",
  x: "X / Twitter",
  linkedin: "LinkedIn",
};

export default function CampaignOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [campRes, bkRes, fwRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/campaigns/${campaignId}/brand-kits`),
          fetch(`/api/frameworks?campaign_id=${campaignId}`),
        ]);
        if (campRes.ok) setCampaign(await campRes.json());
        if (bkRes.ok) setBrandKits(await bkRes.json());
        if (fwRes.ok) {
          const fwData = await fwRes.json();
          setFrameworks(Array.isArray(fwData) ? fwData : []);
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
      if (res.ok) {
        const updated = await res.json();
        setCampaign(updated);
      }
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

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center gap-3">
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Brief Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Campaign Brief
          </h3>
          <div className="space-y-2.5 text-sm">
            {campaign.brief?.target_audience && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Audience:</span>{" "}
                  <span className="text-foreground">
                    {campaign.brief.target_audience}
                  </span>
                </div>
              </div>
            )}
            {campaign.brief?.goals && (
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Goals:</span>{" "}
                  <span className="text-foreground">{campaign.brief.goals}</span>
                </div>
              </div>
            )}
            {campaign.brief?.budget_range && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Budget:</span>{" "}
                  <span className="text-foreground">
                    {campaign.brief.budget_range}
                  </span>
                </div>
              </div>
            )}
            {campaign.brief?.website && (
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Website:</span>{" "}
                  <span className="text-foreground">
                    {campaign.brief.website}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Platforms & Competitors */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Platforms & Competitors
          </h3>
          {campaign.platforms.length > 0 && (
            <div className="mb-3">
              <span className="text-xs text-muted-foreground block mb-1.5">
                Platforms
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.platforms.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                  >
                    {PLATFORM_LABELS[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(campaign.brief?.competitors?.length ?? 0) > 0 && (
            <div>
              <span className="text-xs text-muted-foreground block mb-1.5">
                Competitors
              </span>
              <div className="flex flex-wrap gap-1.5">
                {campaign.brief?.competitors?.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-muted rounded text-xs text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {campaign.platforms.length === 0 &&
            (campaign.brief?.competitors?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">
                No platforms or competitors specified.
              </p>
            )}
        </div>
      </div>

      {/* Creative Readiness */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Creative Readiness
          </h3>
          {brandKits.filter((b) => b.status === "active").length > 0 &&
            frameworks.filter((f) => f.status === "complete").length > 0 && (
              <Link
                href={`/dashboard/campaigns/${campaignId}/generate`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Generate Creative
              </Link>
            )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {brandKits.filter((b) => b.status === "active").length > 0 ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">Brand Kit</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {brandKits.filter((b) => b.status === "active").length > 0
                  ? `${brandKits.filter((b) => b.status === "active").length} active kit(s)`
                  : "No active brand kits"}
              </p>
            </div>
            <Link
              href={`/dashboard/campaigns/${campaignId}/brand-kits`}
              className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              {brandKits.length > 0 ? "Manage" : "Create"}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {frameworks.filter((f) => f.status === "complete").length > 0 ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Messaging Framework
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {frameworks.filter((f) => f.status === "complete").length > 0
                  ? `${frameworks.filter((f) => f.status === "complete").length} complete framework(s)`
                  : "No complete frameworks"}
              </p>
            </div>
            <Link
              href={`/dashboard/campaigns/${campaignId}/frameworks`}
              className="text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
            >
              {frameworks.length > 0 ? "Manage" : "Create"}
            </Link>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Active Jobs
          </h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <JobProgress key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}

      {/* Brand Voice Notes */}
      {campaign.brief?.brand_voice_notes && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Brand Voice Notes
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {campaign.brief.brand_voice_notes}
          </p>
        </div>
      )}
    </div>
  );
}
