"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Palette,
  FileText,
  Wand2,
  Check,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import { useJobs } from "@/lib/hooks/use-jobs";
import JobProgress from "@/components/shared/JobProgress";
import type { BrandKit, MessagingFramework } from "@/lib/types";

const CHANNELS = [
  { key: "facebook", label: "Facebook", color: "bg-blue-500" },
  { key: "instagram", label: "Instagram", color: "bg-pink-500" },
  { key: "tiktok", label: "TikTok", color: "bg-fuchsia-500" },
  { key: "linkedin", label: "LinkedIn", color: "bg-sky-600" },
  { key: "x", label: "X (Twitter)", color: "bg-zinc-500" },
  { key: "youtube", label: "YouTube", color: "bg-red-500" },
];

type Step = 1 | 2 | 3;

export default function GenerateCreativePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOrg } = useOrg();
  const { activeJobs, loadJobs } = useJobs(id);

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Data
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);

  // Selections
  const [selectedBrandKit, setSelectedBrandKit] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "facebook",
    "instagram",
  ]);

  // Load brand kits and frameworks
  useEffect(() => {
    async function load() {
      if (!id || !currentOrg) return;
      try {
        const [bkRes, fwRes] = await Promise.all([
          fetch(`/api/brand-kits?org_id=${currentOrg.id}&campaign_id=${id}`),
          fetch(`/api/frameworks?campaign_id=${id}`),
        ]);

        if (bkRes.ok) {
          const bkData: BrandKit[] = await bkRes.json();
          setBrandKits(bkData);
          // Auto-select first active kit
          const firstActive = bkData.find((k) => k.status === "active");
          if (firstActive) setSelectedBrandKit(firstActive.id);
        }

        if (fwRes.ok) {
          const fwData: MessagingFramework[] = await fwRes.json();
          setFrameworks(fwData);
          // Auto-select first complete framework
          const firstComplete = fwData.find((f) => f.status === "complete");
          if (firstComplete) setSelectedFramework(firstComplete.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentOrg]);

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleGenerate = async () => {
    if (!selectedBrandKit || !selectedFramework || selectedChannels.length === 0)
      return;
    setGenerating(true);
    try {
      const res = await fetch("/api/agents/creative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: id,
          brand_kit_id: selectedBrandKit,
          framework_id: selectedFramework,
          channels: selectedChannels,
        }),
      });

      if (res.ok) {
        if (id) loadJobs(id);
      } else {
        const err = await res.json();
        console.error("Failed to start creative generation:", err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Active creative jobs
  const creativeJobs = activeJobs.filter((j) => j.type === "creative");
  const runningJob = creativeJobs.find(
    (j) => j.status === "pending" || j.status === "running"
  );
  const lastCompleted = creativeJobs.find((j) => j.status === "completed");

  const activeBrandKits = brandKits.filter((k) => k.status === "active");
  const completeFrameworks = frameworks.filter((f) => f.status === "complete");

  const canGenerate =
    !!selectedBrandKit &&
    !!selectedFramework &&
    selectedChannels.length > 0 &&
    !generating &&
    !runningJob;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Generate Creative
        </h2>
        <p className="text-sm text-muted-foreground">
          Select a brand kit, messaging framework, and channels to generate
          platform-specific creative assets.
        </p>
      </div>

      {/* Prerequisites check */}
      {(activeBrandKits.length === 0 || completeFrameworks.length === 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Prerequisites Missing
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              {activeBrandKits.length === 0 && (
                <li>
                  • No active brand kits.{" "}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/campaigns/${id}/brand-kits`
                      )
                    }
                    className="text-primary hover:underline"
                  >
                    Create a brand kit →
                  </button>
                </li>
              )}
              {completeFrameworks.length === 0 && (
                <li>
                  • No complete messaging frameworks.{" "}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/campaigns/${id}/frameworks`
                      )
                    }
                    className="text-primary hover:underline"
                  >
                    Create a framework →
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[
          { num: 1 as Step, label: "Brand Kit", icon: Palette },
          { num: 2 as Step, label: "Framework", icon: FileText },
          { num: 3 as Step, label: "Channels", icon: Wand2 },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            {i > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            )}
            <button
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <s.icon className="w-3.5 h-3.5" />
              )}
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {/* Step 1: Select Brand Kit */}
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Select Brand Kit
          </h3>
          {activeBrandKits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active brand kits available. Create and activate one first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeBrandKits.map((kit) => {
                const colorValues = Object.values(kit.colors || {});
                const isSelected = selectedBrandKit === kit.id;

                return (
                  <button
                    key={kit.id}
                    onClick={() => {
                      setSelectedBrandKit(kit.id);
                      setStep(2);
                    }}
                    className={`bg-card rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    {/* Color strip */}
                    {colorValues.length > 0 && (
                      <div className="flex rounded-lg overflow-hidden h-6 mb-3 border border-border">
                        {colorValues.slice(0, 6).map((c, i) => (
                          <div
                            key={i}
                            className="flex-1"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {kit.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {Object.keys(kit.colors || {}).length} colors •{" "}
                          {Object.keys(kit.fonts || {}).length} fonts
                          {kit.voice_guide ? " • Voice guide" : ""}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Framework */}
      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Select Messaging Framework
          </h3>
          {completeFrameworks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No complete frameworks available. Complete a framework first.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {completeFrameworks.map((fw) => {
                const isSelected = selectedFramework === fw.id;
                const gridTileCount = Object.values(fw.grid || {}).reduce(
                  (sum, tiles) =>
                    sum + (Array.isArray(tiles) ? tiles.length : 0),
                  0
                );

                return (
                  <button
                    key={fw.id}
                    onClick={() => {
                      setSelectedFramework(fw.id);
                      setStep(3);
                    }}
                    className={`bg-card rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {fw.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {fw.name || "Unnamed"} •{" "}
                          {gridTileCount} messaging tiles •{" "}
                          {fw.entity_type}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    {/* Show quadrant summary */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {(
                        [
                          "our-story",
                          "the-attack",
                          "their-defense",
                          "the-counter",
                        ] as const
                      ).map((q) => {
                        const tiles = (
                          (fw.grid as unknown as Record<string, Array<{ text: string }>>) ||
                          {}
                        )[q] || [];
                        return (
                          <div key={q} className="text-[10px]">
                            <span className="text-muted-foreground capitalize">
                              {q.replace(/-/g, " ")}:
                            </span>{" "}
                            <span className="text-foreground">
                              {tiles.length} tile{tiles.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Channels & Generate */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Select Channels
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {CHANNELS.map((ch) => {
                const isSelected = selectedChannels.includes(ch.key);
                return (
                  <button
                    key={ch.key}
                    onClick={() => toggleChannel(ch.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${ch.color}`}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {ch.label}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Generation Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Brand Kit:</span>
                <span className="text-foreground font-medium">
                  {activeBrandKits.find((k) => k.id === selectedBrandKit)
                    ?.name || "Not selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Framework:</span>
                <span className="text-foreground font-medium">
                  {completeFrameworks.find(
                    (f) => f.id === selectedFramework
                  )?.title || "Not selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Channels:</span>
                <span className="text-foreground font-medium">
                  {selectedChannels.length > 0
                    ? selectedChannels
                        .map(
                          (ch) =>
                            CHANNELS.find((c) => c.key === ch)?.label || ch
                        )
                        .join(", ")
                    : "None selected"}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <span className="text-muted-foreground">Estimated output:</span>
                <span className="text-foreground font-medium">
                  ~{selectedChannels.length * 2} creative assets
                </span>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {generating || runningJob ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Wand2 className="w-5 h-5" />
            )}
            {runningJob
              ? "Generating..."
              : `Generate Creative for ${selectedChannels.length} Channel${selectedChannels.length !== 1 ? "s" : ""}`}
          </button>
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

      {/* Completion redirect */}
      {lastCompleted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-foreground">
              Creative generation complete!
            </span>
          </div>
          <button
            onClick={() =>
              router.push(`/dashboard/campaigns/${id}/creative`)
            }
            className="text-sm text-primary hover:underline"
          >
            View Creative Assets →
          </button>
        </div>
      )}
    </div>
  );
}
