"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Target,
  Globe,
  Palette,
} from "lucide-react";
import type { CampaignBrief } from "@/lib/types";

const PLATFORM_OPTIONS = [
  { value: "meta_feed", label: "Meta (Feed)" },
  { value: "meta_stories", label: "Meta (Stories)" },
  { value: "x", label: "X / Twitter" },
  { value: "linkedin", label: "LinkedIn" },
];

interface CampaignBriefFormProps {
  orgId: string;
  clientId?: string;
}

export default function CampaignBriefForm({ orgId, clientId }: CampaignBriefFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [brief, setBrief] = useState<CampaignBrief>({
    brand_name: "",
    industry: "",
    competitors: [],
    target_audience: "",
    goals: "",
    budget_range: "",
    platforms: [],
    brand_voice_notes: "",
    website: "",
  });
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");

  const updateBrief = (key: keyof CampaignBrief, value: unknown) => {
    setBrief((prev) => ({ ...prev, [key]: value }));
  };

  const addCompetitor = () => {
    const trimmed = competitorInput.trim();
    if (trimmed && !brief.competitors?.includes(trimmed)) {
      updateBrief("competitors", [...(brief.competitors || []), trimmed]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (name: string) => {
    updateBrief(
      "competitors",
      (brief.competitors || []).filter((c) => c !== name)
    );
  };

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Campaign name is required");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: orgId,
          client_id: clientId || undefined,
          name: name.trim(),
          brief: { ...brief, platforms },
          platforms,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      const data = await res.json();
      router.push(`/dashboard/campaigns/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 mx-1 ${
                  s < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Campaign Basics
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q2 Brand Awareness Push"
              className={inputClass}
              autoFocus
            />
          </div>

          {/* Only show client fields if not under a client context */}
          {!clientId && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Brand / Client Name
                </label>
                <input
                  type="text"
                  value={brief.brand_name || ""}
                  onChange={(e) => updateBrief("brand_name", e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={brief.industry || ""}
                  onChange={(e) => updateBrief("industry", e.target.value)}
                  placeholder="e.g. SaaS, E-commerce, Political"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  value={brief.website || ""}
                  onChange={(e) => updateBrief("website", e.target.value)}
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2: Audience & Goals */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Audience & Goals
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Target Audience
            </label>
            <textarea
              value={brief.target_audience || ""}
              onChange={(e) => updateBrief("target_audience", e.target.value)}
              placeholder="Describe your target audience..."
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Campaign Goals
            </label>
            <textarea
              value={brief.goals || ""}
              onChange={(e) => updateBrief("goals", e.target.value)}
              placeholder="What are you trying to achieve?"
              rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Competitors
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => setCompetitorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                placeholder="Add a competitor name"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addCompetitor}
                className="px-4 py-2.5 bg-muted text-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors shrink-0"
              >
                Add
              </button>
            </div>
            {(brief.competitors?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {brief.competitors?.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs text-foreground"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => removeCompetitor(c)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Budget Range
            </label>
            <input
              type="text"
              value={brief.budget_range || ""}
              onChange={(e) => updateBrief("budget_range", e.target.value)}
              placeholder="e.g. $5,000 - $10,000"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Step 3: Platforms & Voice */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Platforms & Brand Voice
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Target Platforms
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-colors ${
                    platforms.includes(p.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Brand Voice Notes
            </label>
            <textarea
              value={brief.brand_voice_notes || ""}
              onChange={(e) =>
                updateBrief("brand_voice_notes", e.target.value)
              }
              placeholder="Describe the tone and voice for this campaign..."
              rows={4}
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2 mt-4">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Create Campaign
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
