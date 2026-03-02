"use client";

import { useState } from "react";
import { Sparkles, Loader2, ArrowRight, AlertCircle, X } from "lucide-react";
import JobProgress from "@/components/shared/JobProgress";
import { useBrandKitJobs } from "@/lib/hooks/use-brand-kit-jobs";

interface GenerationFormProps {
  brandKitId: string;
  orgId: string;
  onComplete: () => void;
  onError?: (error: string) => void;
}

const PERSONALITY_SUGGESTIONS = [
  "Bold",
  "Elegant",
  "Playful",
  "Professional",
  "Warm",
  "Innovative",
  "Trustworthy",
  "Minimalist",
  "Energetic",
  "Sophisticated",
  "Approachable",
  "Authoritative",
];

export function GenerationForm({
  brandKitId,
  orgId,
  onComplete,
}: GenerationFormProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [personalityTraits, setPersonalityTraits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const { job, isRunning, isComplete, isFailed } = useBrandKitJobs(jobId);

  if (isComplete && jobId) {
    setTimeout(() => onComplete(), 100);
  }

  const toggleTrait = (trait: string) => {
    setPersonalityTraits((prev) =>
      prev.includes(trait)
        ? prev.filter((t) => t !== trait)
        : prev.length < 5
          ? [...prev, trait]
          : prev
    );
  };

  const handleSubmit = async () => {
    if (!brandName.trim() || !industry.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agents/brand-generation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_kit_id: brandKitId,
          org_id: orgId,
          brand_name: brandName.trim(),
          industry: industry.trim(),
          target_audience: targetAudience.trim() || undefined,
          personality_traits: personalityTraits,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start generation");
      }

      const { jobId: newJobId } = await res.json();
      setJobId(newJobId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start generation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Generate Brand Identity
            </h3>
            <p className="text-sm text-muted-foreground">
              AI will create color palettes, font pairings, logo concepts, and a
              voice guide
            </p>
          </div>
        </div>

        {!jobId && (
          <div className="space-y-4">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Brand Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g., Acme Corp"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Industry <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., SaaS, Healthcare, E-commerce, Real Estate"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Small business owners aged 30-50"
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Brand Personality{" "}
                <span className="text-muted-foreground font-normal">
                  (pick up to 5)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_SUGGESTIONS.map((trait) => (
                  <button
                    key={trait}
                    onClick={() => toggleTrait(trait)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      personalityTraits.includes(trait)
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    {personalityTraits.includes(trait) && (
                      <X className="w-3 h-3 inline mr-1" />
                    )}
                    {trait}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                onClick={handleSubmit}
                disabled={!brandName.trim() || !industry.trim() || submitting}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors w-full justify-center"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {submitting ? "Starting..." : "Generate Brand Identity"}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}

        {jobId && (
          <div className="mt-4">
            {job && <JobProgress job={job} />}
            {isFailed && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-red-400 mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {job?.error || "Generation failed"}
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
                Generating brand identity options including AI logo concepts...
                This usually takes 1-2 minutes.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
