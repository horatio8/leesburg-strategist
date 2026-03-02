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
} from "lucide-react";
import JobProgress from "@/components/shared/JobProgress";
import type { Campaign, Job } from "@/lib/types";

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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (res.ok) setCampaign(await res.json());
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
