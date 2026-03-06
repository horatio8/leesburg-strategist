"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Wand2, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { useJobs } from "@/lib/hooks/use-jobs";
import CreativeAssetGrid from "@/components/campaigns/CreativeAssetGrid";
import JobProgress from "@/components/shared/JobProgress";
import type { Creative } from "@/lib/types";

export default function CampaignCreativePage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, concepts } = useCampaignStore();
  const { activeJobs, loadJobs } = useJobs(id);
  const [loading, setLoading] = useState(true);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [groupBy, setGroupBy] = useState<"platform" | "concept" | "none">(
    "platform"
  );

  const loadCreatives = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/campaigns/${id}/creatives`);
      if (res.ok) {
        const data = await res.json();
        setCreatives(Array.isArray(data) ? data : []);
      }
    } catch {
      // Will fall through to empty state
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCreatives();
    if (id) loadJobs(id);
  }, [id, loadCreatives, loadJobs]);

  // When a creative job completes, reload creatives
  const creativeJobs = activeJobs.filter((j) => j.type === "creative");
  const runningJob = creativeJobs.find(
    (j) => j.status === "pending" || j.status === "running"
  );
  const lastCompletedJob = creativeJobs.find(
    (j) => j.status === "completed"
  );

  useEffect(() => {
    if (lastCompletedJob) {
      loadCreatives();
    }
  }, [lastCompletedJob, loadCreatives]);

  const hasConcepts = concepts.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Creative Assets
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-generated copy, visuals, and platform-specific creatives
          </p>
        </div>
        <div className="flex items-center gap-2">
          {creatives.length > 0 && (
            <>
              <select
                value={groupBy}
                onChange={(e) =>
                  setGroupBy(
                    e.target.value as "platform" | "concept" | "none"
                  )
                }
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
              >
                <option value="platform">Group by Platform</option>
                <option value="concept">Group by Concept</option>
                <option value="none">No Grouping</option>
              </select>
              <button
                onClick={loadCreatives}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </>
          )}
          <Link
            href={`/dashboard/campaigns/${id}/generate`}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            {creatives.length > 0
              ? "Generate More Creatives"
              : "Generate Creatives"}
          </Link>
        </div>
      </div>

      {/* Empty state — direct to generate wizard */}
      {creatives.length === 0 && !runningJob && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Wand2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No Creatives Yet
          </h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
            Use the Generate wizard to create platform-specific ads.
            Select a brand kit, messaging framework, and target channels.
          </p>
          <Link
            href={`/dashboard/campaigns/${id}/generate`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Wand2 className="w-4 h-4" />
            Open Generate Wizard
          </Link>
        </div>
      )}

      {/* Active creative jobs */}
      {creativeJobs.length > 0 && (
        <div className="space-y-2">
          {creativeJobs
            .filter((j) => j.status !== "completed")
            .map((job) => (
              <JobProgress key={job.id} job={job} />
            ))}
        </div>
      )}

      {/* Creative results */}
      <CreativeAssetGrid creatives={creatives} groupBy={groupBy} />

      {/* Stats summary */}
      {creatives.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {creatives.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Assets</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {creatives.filter((c) => c.type === "copy").length}
              </p>
              <p className="text-xs text-muted-foreground">Copy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {creatives.filter((c) => c.type === "image").length}
              </p>
              <p className="text-xs text-muted-foreground">Visual</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {
                  new Set(
                    creatives
                      .map((c) => c.platform)
                      .filter(Boolean)
                  ).size
                }
              </p>
              <p className="text-xs text-muted-foreground">Platforms</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
