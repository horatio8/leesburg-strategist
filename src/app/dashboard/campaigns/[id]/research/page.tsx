"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Play, Loader2, RefreshCw } from "lucide-react";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import { useJobs } from "@/lib/hooks/use-jobs";
import ResearchReport from "@/components/campaigns/ResearchReport";
import JobProgress from "@/components/shared/JobProgress";

export default function CampaignResearchPage() {
  const { id } = useParams<{ id: string }>();
  const { campaign, research, setResearch } = useCampaignStore();
  const { activeJobs, loadJobs } = useJobs(id);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Load research data
  const loadResearch = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/campaigns/${id}/research`);
      if (res.ok) {
        const data = await res.json();
        setResearch(Array.isArray(data) ? data : []);
      }
    } catch {
      // Will fall through to empty state
    } finally {
      setLoading(false);
    }
  }, [id, setResearch]);

  useEffect(() => {
    loadResearch();
    if (id) loadJobs(id);
  }, [id, loadResearch, loadJobs]);

  // When a research job completes, reload research data
  const researchJobs = activeJobs.filter((j) => j.type === "research");
  const runningJob = researchJobs.find(
    (j) => j.status === "pending" || j.status === "running"
  );
  const lastCompletedJob = researchJobs.find(
    (j) => j.status === "completed"
  );

  useEffect(() => {
    if (lastCompletedJob) {
      loadResearch();
    }
  }, [lastCompletedJob, loadResearch]);

  const handleStartResearch = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const res = await fetch("/api/agents/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: id }),
      });

      if (res.ok) {
        // Job created — Realtime will update activeJobs
        if (id) loadJobs(id);
      } else {
        const err = await res.json();
        console.error("Failed to start research:", err);
      }
    } catch (err) {
      console.error("Failed to start research:", err);
    } finally {
      setStarting(false);
    }
  };

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
            Market Research
          </h2>
          <p className="text-sm text-muted-foreground">
            AI-powered competitor analysis, social audit, and strategic
            intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          {research.length > 0 && (
            <button
              onClick={loadResearch}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
          <button
            onClick={handleStartResearch}
            disabled={starting || !!runningJob}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {starting || runningJob ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {runningJob
              ? "Researching..."
              : research.length > 0
                ? "Re-run Research"
                : "Start Research"}
          </button>
        </div>
      </div>

      {/* Active research jobs */}
      {researchJobs.length > 0 && (
        <div className="space-y-2">
          {researchJobs
            .filter((j) => j.status !== "completed")
            .map((job) => (
              <JobProgress key={job.id} job={job} />
            ))}
        </div>
      )}

      {/* Research results */}
      <ResearchReport research={research} />

      {/* Brief context when no research yet */}
      {campaign?.brief && research.length === 0 && !runningJob && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Campaign Brief
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            The research agent will analyze the following to generate
            intelligence:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {campaign.brief.brand_name && (
              <div>
                <span className="text-muted-foreground">Brand:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.brand_name}
                </span>
              </div>
            )}
            {campaign.brief.industry && (
              <div>
                <span className="text-muted-foreground">Industry:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.industry}
                </span>
              </div>
            )}
            {campaign.brief.target_audience && (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Audience:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.target_audience}
                </span>
              </div>
            )}
            {campaign.brief.competitors?.length ? (
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Competitors:</span>{" "}
                <span className="text-foreground">
                  {campaign.brief.competitors.join(", ")}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
