"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/lib/store";
import {
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
  Pencil,
  Check,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  UserMinus,
} from "lucide-react";

const DistrictMap = dynamic(() => import("./DistrictMap"), {
  ssr: false,
  loading: () => (
    <div className="mt-4 rounded-lg border border-border bg-muted/30 flex items-center justify-center" style={{ height: "320px" }}>
      <p className="text-sm text-muted-foreground">Loading map...</p>
    </div>
  ),
});

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
};

export default function PreliminaryResearch() {
  const {
    researchInput,
    researchSections,
    setResearchSections,
    updateResearchSection,
    isResearching,
    setIsResearching,
    setCurrentStep,
    mapData,
    setMapData,
    oppositionResearch,
    setOppositionResearch,
    updateOppositionResearch,
    isResearchingOpposition,
    setIsResearchingOpposition,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [editOppText, setEditOppText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditText(content);
  };

  const saveEdit = (id: string) => {
    updateResearchSection(id, editText);
    setEditingId(null);
  };

  const deleteSection = (id: string) => {
    setResearchSections(researchSections.filter((s) => s.id !== id));
  };

  const startEditOpp = (oppId: string, content: string) => {
    setEditingOppId(oppId);
    setEditOppText(content);
  };

  const saveEditOpp = (oppId: string) => {
    updateOppositionResearch(oppId, editOppText);
    setEditingOppId(null);
  };

  const handleRerunResearch = async () => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Research failed. Please try again.";
      setError(message);
    } finally {
      setIsResearching(false);
    }
  };

  const handleOppositionResearch = async () => {
    const validOppositions = researchInput.oppositions.filter((o) => o.name.trim());
    if (validOppositions.length === 0) return;

    setIsResearchingOpposition(true);
    setError(null);

    try {
      const res = await fetch("/api/opposition-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oppositions: validOppositions,
          entityType: researchInput.entityType,
          campaignName: researchInput.name,
          location: researchInput.location,
          goal: researchInput.goal,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opposition research failed");
      }

      const data = await res.json();
      setOppositionResearch(data.research);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Opposition research failed.";
      setError(message);
    } finally {
      setIsResearchingOpposition(false);
    }
  };

  const validOppositions = researchInput.oppositions.filter((o) => o.name.trim());
  const hasOppositionResearch = oppositionResearch.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Step 2: Preliminary Research</h1>
          <p className="text-muted-foreground">
            Review and edit AI-generated research about your campaign landscape.
          </p>
        </div>
        <button
          onClick={handleRerunResearch}
          disabled={isResearching}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          {isResearching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Re-run Research
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Research Loading State */}
      {isResearching && (
        <div className="space-y-4 mb-8">
          {["Geographic Profile", "Electoral Data", "Incumbent Audit", "Issue Pulse", "Strategic Context"].map((title, i) => (
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

      {/* Research Results */}
      {!isResearching && researchSections.length > 0 && (
        <div className="space-y-4 mb-8">
          {researchSections.map((section) => {
            const Icon = iconMap[section.icon] || MapPin;
            const isEditing = editingId === section.id;

            return (
              <div
                key={section.id}
                className="bg-card rounded-xl border border-border p-6 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(section.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-green-600"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(section.id, section.content)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[120px]"
                    rows={6}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                )}

                {section.id === "geographic" && mapData && (
                  <DistrictMap mapData={mapData} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Opposition Research Section */}
      {validOppositions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <UserMinus className="w-4 h-4 text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Opposition Research</h2>
            </div>
            {!isResearchingOpposition && (
              <button
                onClick={handleOppositionResearch}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                {hasOppositionResearch ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Re-run Opposition Research
                  </>
                ) : (
                  <>
                    <UserSearch className="w-4 h-4" />
                    Generate Opposition Research
                  </>
                )}
              </button>
            )}
          </div>

          {/* Opposition Research Loading */}
          {isResearchingOpposition && (
            <div className="space-y-4">
              {validOppositions.map((opp) => (
                <div key={opp.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted research-pulse" />
                    <div className="h-5 w-48 bg-muted rounded research-pulse" />
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

          {/* Opposition Research Results */}
          {!isResearchingOpposition && hasOppositionResearch && (
            <div className="space-y-4">
              {oppositionResearch.map((research) => {
                const isEditing = editingOppId === research.oppositionId;

                return (
                  <div
                    key={research.oppositionId}
                    className="bg-card rounded-xl border border-red-200/50 p-6 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <UserMinus className="w-4 h-4 text-red-500" />
                        </div>
                        <h3 className="font-semibold">{research.oppositionName}</h3>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <button
                            onClick={() => saveEditOpp(research.oppositionId)}
                            className="p-1.5 rounded-lg hover:bg-muted text-green-600"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditOpp(research.oppositionId, research.content)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editOppText}
                        onChange={(e) => setEditOppText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[120px]"
                        rows={8}
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {research.content}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* No opposition research yet */}
          {!isResearchingOpposition && !hasOppositionResearch && (
            <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
              <UserMinus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                You have {validOppositions.length} opposition{validOppositions.length > 1 ? "s" : ""} defined. Generate AI research to learn about them.
              </p>
              <button
                onClick={handleOppositionResearch}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <UserSearch className="w-4 h-4" />
                Generate Opposition Research
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Build Strategy Grid
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
