"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import type { StrategyTile, QuadrantKey } from "@/lib/types";
import { QUADRANT_META } from "@/lib/constants";

interface DraggableTileProps {
  tile: StrategyTile;
  quadrantKey: QuadrantKey;
  onEdit?: (tileId: string, text: string) => void;
  onRemove?: () => void;
  isInGrid?: boolean;
}

export default function DraggableTile({
  tile,
  quadrantKey,
  onEdit,
  onRemove,
  isInGrid = false,
}: DraggableTileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tile.text);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: tile.id,
      data: { tile, sourceQuadrant: quadrantKey, isInGrid },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const meta = QUADRANT_META[quadrantKey];

  const handleSave = () => {
    if (onEdit && editText.trim()) {
      onEdit(tile.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-2 p-3 rounded-lg border text-sm transition-all
        ${
          isInGrid
            ? `${meta.bgColor} ${meta.borderColor} ${meta.color}`
            : `bg-card border-border hover:border-muted-foreground/30`
        }
        ${isDragging ? "shadow-lg ring-2 ring-primary/30" : ""}
        ${tile.isCustom ? "border-dashed" : ""}
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 p-0.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-2 py-1 rounded bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
              rows={2}
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="p-1 rounded hover:bg-muted text-green-400"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditText(tile.text);
                  setIsEditing(false);
                }}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <p className="leading-snug">{tile.text}</p>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-muted text-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
