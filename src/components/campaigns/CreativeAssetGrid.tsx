"use client";

import { useMemo } from "react";
import type { Creative } from "@/lib/types";
import CreativeConceptCard from "./CreativeConceptCard";

const platformOrder = [
  "meta_feed",
  "meta_stories",
  "instagram",
  "linkedin",
  "x",
  "multi",
];

interface CreativeAssetGridProps {
  creatives: Creative[];
  groupBy?: "platform" | "concept" | "none";
}

export default function CreativeAssetGrid({
  creatives,
  groupBy = "platform",
}: CreativeAssetGridProps) {
  const grouped = useMemo(() => {
    if (groupBy === "none") {
      return { All: creatives };
    }

    if (groupBy === "platform") {
      const groups: Record<string, Creative[]> = {};
      for (const c of creatives) {
        const key = c.platform || "multi";
        if (!groups[key]) groups[key] = [];
        groups[key].push(c);
      }
      // Sort by platform order
      const sorted: Record<string, Creative[]> = {};
      for (const p of platformOrder) {
        if (groups[p]) sorted[p] = groups[p];
      }
      // Add any remaining
      for (const [k, v] of Object.entries(groups)) {
        if (!sorted[k]) sorted[k] = v;
      }
      return sorted;
    }

    // Group by concept
    const groups: Record<string, Creative[]> = {};
    for (const c of creatives) {
      const conceptData = c as Creative & {
        concept?: { name?: string } | null;
      };
      const key = conceptData.concept?.name || c.concept_id || "Ungrouped";
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return groups;
  }, [creatives, groupBy]);

  const platformLabels: Record<string, string> = {
    meta_feed: "Meta Feed",
    meta_stories: "Meta Stories",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X / Twitter",
    multi: "Multi-platform",
  };

  if (creatives.length === 0) return null;

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupKey, items]) => (
        <div key={groupKey}>
          {groupBy !== "none" && (
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                {platformLabels[groupKey] || groupKey}
              </h3>
              <span className="text-xs text-muted-foreground">
                {items.length} creative{items.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="space-y-3">
            {items.map((creative) => (
              <CreativeConceptCard key={creative.id} creative={creative} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
