"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Play, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
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
  const [starting, setStarting] = useState(false);
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

  const handleStartCreative = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const res = await fetch("/api/agents/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: id }),
      });

      if (res.ok) {
        if (id) loadJobs(id);
      } else {
        const err = await res.json();
        console.error("Failed to start creative generation:", err);
      }
    } catch (err) {
      console.error("Failed to start creative generation:", err);
    } finally {
      setStarting(false);
    }
  };

  const approvedConcepts = concepts.filter((c) => c.status === "approved");
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
          <button
            onClick={handleStartCreative}
            disabled={starting || !!runningJob || !hasConcepts}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {starting || runningJob ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {runningJob
              ? "Generating..."
              : creatives.length > 0
                ? "Re-generate Creatives"
                : "Generate Creatives"}
          </button>
        </div>
      </div>

      {/* No concepts warning */}
      {!hasConcepts && creatives.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Creative Concepts Required
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Run the Strategy agent first to generate creative concepts. The
              Creative agent uses approved concepts to generate platform-specific
              copy, visual briefs, and A/B variations.
            </p>
          </div>
        </div>
      )}

      {/* Approved concepts info */}
      {hasConcepts && creatives.length === 0 && !runningJob && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Ready to Generate Creatives
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {approvedConcepts.length > 0
              ? `${approvedConcepts.length} approved concept(s) ready.`
              : `${concepts.length} concept(s) available (approve concepts in Strategy for best results).`}{" "}
            The creative agent will generate platform-specific assets for each
            concept.
          </p>
          <div className="space-y-2">
            {concepts.slice(0, 5).map((concept) => (
              <div
                key={concept.id}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    concept.status === "approved"
                      ? "bg-emerald-500"
                      : concept.status === "rejected"
                        ? "bg-red-500"
                        : "bg-amber-500"
                  }`}
                />
                <span className="text-foreground font-medium">
                  {concept.name}
                </span>
                <span className="text-muted-foreground capitalize">
                  ({concept.status})
                </span>
              </div>
            ))}
            {concepts.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{concepts.length - 5} more concept(s)
              </p>
            )}
          </div>
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
