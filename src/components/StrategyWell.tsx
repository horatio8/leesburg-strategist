"use client";

import { useState } from "react";
import type { QuadrantKey, StrategyTile } from "@/lib/types";
import { QUADRANT_META } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import DraggableTile from "./DraggableTile";
import { Plus, Shield, Swords, ShieldAlert, Undo2 } from "lucide-react";

const quadrantIcons: Record<QuadrantKey, React.ElementType> = {
  "our-story": Shield,
  "the-attack": Swords,
  "their-defense": ShieldAlert,
  "the-counter": Undo2,
};

interface StrategyWellProps {
  quadrantKey: QuadrantKey;
  tiles: StrategyTile[];
}

export default function StrategyWell({
  quadrantKey,
  tiles,
}: StrategyWellProps) {
  const [customText, setCustomText] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const { updateWellTile, addCustomTile } = useAppStore();

  const meta = QUADRANT_META[quadrantKey];
  const Icon = quadrantIcons[quadrantKey];

  const handleAddCustom = () => {
    if (customText.trim()) {
      addCustomTile(quadrantKey, customText.trim());
      setCustomText("");
      setShowCustom(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className={`w-4 h-4 ${meta.color}`} />
        <h3 className={`font-semibold text-sm ${meta.color}`}>{meta.title}</h3>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {tiles.length} options
        </span>
      </div>

      {/* Tiles */}
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
        {/* Add Custom Tile — at top for visibility */}
        {showCustom ? (
          <div className="p-2 rounded-lg border border-dashed border-border">
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Add your own strategy angle..."
              className="w-full px-2 py-1 rounded bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-1 mt-1">
              <button
                onClick={handleAddCustom}
                className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomText("");
                }}
                className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustom(true)}
            className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all text-xs"
          >
            <Plus className="w-3 h-3" />
            Add Custom Strategy
          </button>
        )}

        {tiles.map((tile) => (
          <DraggableTile
            key={tile.id}
            tile={tile}
            quadrantKey={quadrantKey}
            onEdit={(id, text) => updateWellTile(quadrantKey, id, text)}
          />
        ))}
      </div>
    </div>
  );
}
