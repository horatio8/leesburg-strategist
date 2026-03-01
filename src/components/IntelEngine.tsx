"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { EntityType } from "@/lib/types";

import {
  Search,
  Loader2,
  User,
  Building2,
  Landmark,
  Globe,
  AtSign,
  Plus,
  X,
  UserMinus,
} from "lucide-react";

const entityTypes: { value: EntityType; label: string; icon: React.ElementType }[] = [
  { value: "candidate", label: "Candidate", icon: User },
  { value: "pac", label: "PAC", icon: Landmark },
  { value: "business", label: "Business", icon: Building2 },
];

const socialPlatforms: { key: "twitter" | "facebook" | "instagram" | "linkedin" | "tiktok" | "youtube"; label: string; placeholder: string }[] = [
  { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
  { key: "facebook", label: "Facebook", placeholder: "facebook.com/page" },
  { key: "instagram", label: "Instagram", placeholder: "@handle" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/profile" },
  { key: "tiktok", label: "TikTok", placeholder: "@handle" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@channel" },
];

export default function IntelEngine() {
  const {
    researchInput,
    setResearchInput,
    setResearchSections,
    isResearching,
    setIsResearching,
    setCurrentStep,
    setMapData,
    addOpposition,
    removeOpposition,
    updateOpposition,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!researchInput.name || !researchInput.location || !researchInput.goal) {
      setError("Please fill in all required fields");
      return;
    }

    setError(null);
    setIsResearching(true);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(researchInput),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Research failed");
      }

      const data = await res.json();
      setResearchSections(data.sections);
      if (data.mapData) {
        setMapData(data.mapData);
      }

      // Auto-advance to Preliminary Research step
      setCurrentStep(2);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Research failed. Please try again.";
      setError(message);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Step 1: Your Campaign</h1>
        <p className="text-muted-foreground">
          Define your campaign and let AI research the political landscape.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="grid gap-6">
          {/* Entity Type Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Select your entity type
            </label>
            <div className="flex gap-2">
              {entityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() =>
                      setResearchInput({
                        ...researchInput,
                        entityType: type.value,
                      })
                    }
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                      ${
                        researchInput.entityType === type.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Jane Smith"
                value={researchInput.name}
                onChange={(e) =>
                  setResearchInput({ ...researchInput, name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                District / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Virginia's 10th Congressional District"
                value={researchInput.location}
                onChange={(e) =>
                  setResearchInput({
                    ...researchInput,
                    location: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Strategic Goal <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="e.g., Win the Democratic primary by mobilizing suburban voters concerned about education funding..."
              value={researchInput.goal}
              onChange={(e) =>
                setResearchInput({ ...researchInput, goal: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
            />
          </div>

          {/* Campaign Website */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Campaign Website
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="url"
                placeholder="https://www.example.com"
                value={researchInput.website}
                onChange={(e) =>
                  setResearchInput({ ...researchInput, website: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">
              The AI will use this URL to enhance its research
            </p>
          </div>

          {/* Social Media Handles */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <AtSign className="w-4 h-4" />
                Social Media Handles
              </span>
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {socialPlatforms.map((platform) => (
                <div key={platform.key}>
                  <label className="block text-xs text-muted-foreground/60 mb-1">
                    {platform.label}
                  </label>
                  <input
                    type="text"
                    placeholder={platform.placeholder}
                    value={researchInput.socialMedia[platform.key]}
                    onChange={(e) =>
                      setResearchInput({
                        ...researchInput,
                        socialMedia: {
                          ...researchInput.socialMedia,
                          [platform.key]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Opposition Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <UserMinus className="w-4 h-4" />
                Opposition (Optional)
              </span>
            </label>
            <p className="text-xs text-muted-foreground/60 mb-3">
              Add opponents or competing entities (e.g., the incumbent, another PAC). The AI will research them too.
            </p>

            {researchInput.oppositions.length > 0 && (
              <div className="space-y-3 mb-3">
                {researchInput.oppositions.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background"
                  >
                    <div className="flex-1 grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Opposition name"
                        value={opp.name}
                        onChange={(e) => updateOpposition(opp.id, "name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                      <input
                        type="text"
                        placeholder="Website (optional)"
                        value={opp.website}
                        onChange={(e) => updateOpposition(opp.id, "website", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={() => removeOpposition(opp.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors mt-1"
                      title="Remove opposition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addOpposition}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Opposition
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleResearch}
            disabled={isResearching}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Launch Research
              </>
            )}
          </button>
        </div>
      </div>

      {/* Research Loading State */}
      {isResearching && (
        <div className="space-y-4">
          {[
            "Geographic Profile",
            "Electoral Data",
            "Incumbent Audit",
            "Issue Pulse",
            "Strategic Context",
          ].map((title, i) => (
            <div
              key={title}
              className="bg-card rounded-xl border border-border p-6"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-muted research-pulse" />
                <div className="h-5 w-40 bg-muted rounded research-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted/50 rounded research-pulse" />
                <div className="h-4 w-3/4 bg-muted/50 rounded research-pulse" />
                <div className="h-4 w-5/6 bg-muted/50 rounded research-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
