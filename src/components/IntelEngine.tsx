"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { EntityType } from "@/lib/types";
import {
  Search,
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
  Pencil,
  Check,
  Trash2,
  ArrowRight,
  Loader2,
  User,
  Building2,
  Landmark,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
};

const entityTypes: { value: EntityType; label: string; icon: React.ElementType }[] = [
  { value: "candidate", label: "Candidate", icon: User },
  { value: "pac", label: "PAC", icon: Landmark },
  { value: "business", label: "Business", icon: Building2 },
];

export default function IntelEngine() {
  const {
    researchInput,
    setResearchInput,
    researchSections,
    setResearchSections,
    updateResearchSection,
    isResearching,
    setIsResearching,
    setCurrentStep,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!researchInput.name || !researchInput.location || !researchInput.goal) {
      setError("Please fill in all fields");
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Research failed. Please try again.";
      setError(message);
    } finally {
      setIsResearching(false);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">The Intel Engine</h1>
        <p className="text-muted-foreground">
          Define your target and let AI research the political landscape.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="grid gap-6">
          {/* Entity Type Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Entity Type
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
                Name
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
                District / Location
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
              Strategic Goal
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

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
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

      {/* Research Results */}
      {!isResearching && researchSections.length > 0 && (
        <>
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
                          className="p-1.5 rounded-lg hover:bg-muted text-green-400"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            startEdit(section.id, section.content)
                          }
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-red-400"
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
                </div>
              );
            })}
          </div>

          {/* Proceed Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Build Strategy Grid
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
