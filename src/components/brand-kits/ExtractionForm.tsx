"use client";

import { useState } from "react";
import { Globe, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { JobProgress } from "@/components/shared/JobProgress";
import { useBrandKitJobs } from "@/lib/hooks/use-brand-kit-jobs";

interface ExtractionFormProps {
  brandKitId: string;
  orgId: string;
  onComplete: () => void;
  onError?: (error: string) => void;
}

export function ExtractionForm({
  brandKitId,
  orgId,
  onComplete,
}: ExtractionFormProps) {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const { job, isRunning, isComplete, isFailed } = useBrandKitJobs(jobId);

  // When job completes, notify parent
  if (isComplete && jobId) {
    // Use setTimeout to avoid setState during render
    setTimeout(() => onComplete(), 100);
  }

  const handleSubmit = async () => {
    // Basic URL validation
    let normalizedUrl = url.trim();
    if (!normalizedUrl) return;

    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agents/brand-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_kit_id: brandKitId,
          website_url: normalizedUrl,
          org_id: orgId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start extraction");
      }

      const { jobId: newJobId } = await res.json();
      setJobId(newJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start extraction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Extract from Website
            </h3>
            <p className="text-sm text-muted-foreground">
              We&apos;ll analyze your website to pull brand colors, fonts, voice, and
              visual style
            </p>
          </div>
        </div>

        {!jobId && (
          <>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://yourbrand.com"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                disabled={submitting}
              />
              <button
                onClick={handleSubmit}
                disabled={!url.trim() || submitting}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Extract
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 mt-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-3">
              Works best with static websites. JavaScript-heavy sites (SPAs) may
              have limited extraction accuracy.
            </p>
          </>
        )}

        {jobId && (
          <div className="mt-4">
            <JobProgress job={job} />
            {isFailed && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {job?.error || "Extraction failed"}
                </div>
                <button
                  onClick={() => {
                    setJobId(null);
                    setError(null);
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            {isRunning && (
              <p className="text-xs text-muted-foreground mt-3">
                Fetching and analyzing website content... This usually takes
                30-60 seconds.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
