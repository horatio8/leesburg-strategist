"use client";

import { useDroppable } from "@dnd-kit/core";
import type { QuadrantKey, StrategyTile } from "@/lib/types";
import { QUADRANT_META, MAX_TILES_PER_QUADRANT } from "@/lib/constants";
import DraggableTile from "./DraggableTile";
import { Shield, Swords, ShieldAlert, Undo2 } from "lucide-react";

const quadrantIcons: Record<QuadrantKey, React.ElementType> = {
  "our-story": Shield,
  "the-attack": Swords,
  "their-defense": ShieldAlert,
  "the-counter": Undo2,
};

interface DroppableQuadrantProps {
  quadrantKey: QuadrantKey;
  tiles: StrategyTile[];
  onRemoveTile: (tileId: string) => void;
}

export default function DroppableQuadrant({
  quadrantKey,
  tiles,
  onRemoveTile,
}: DroppableQuadrantProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `grid-${quadrantKey}`,
    data: { quadrantKey },
  });

  const meta = QUADRANT_META[quadrantKey];
  const isFull = tiles.length >= MAX_TILES_PER_QUADRANT;
  const Icon = quadrantIcons[quadrantKey];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border-2 p-4 min-h-[280px] transition-all flex flex-col
        ${meta.borderColor}
        ${isOver && !isFull ? "drop-active scale-[1.01]" : ""}
        ${isFull ? "opacity-80" : ""}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${meta.color}`} />
          <div>
            <h3 className={`font-semibold text-sm ${meta.color}`}>
              {meta.title}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {meta.subtitle}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full ${
            isFull
              ? "bg-green-100 text-green-700"
              : `${meta.bgColor} ${meta.color}`
          }`}
        >
          {tiles.length}/{MAX_TILES_PER_QUADRANT}
        </span>
      </div>

      {/* Tiles */}
      <div className="flex-1 space-y-2">
        {tiles.map((tile) => (
          <DraggableTile
            key={tile.id}
            tile={tile}
            quadrantKey={quadrantKey}
            isInGrid={true}
            onRemove={() => onRemoveTile(tile.id)}
          />
        ))}

        {/* Empty State */}
        {tiles.length === 0 && (
          <div
            className={`flex items-center justify-center h-full min-h-[100px] rounded-lg border-2 border-dashed ${meta.borderColor} opacity-30`}
          >
            <p className="text-sm text-muted-foreground">
              Drop strategies here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
