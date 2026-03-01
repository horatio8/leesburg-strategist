"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useAppStore } from "@/lib/store";
import type { QuadrantKey, StrategyTile } from "@/lib/types";
import { QUADRANT_META, MAX_TILES_PER_QUADRANT } from "@/lib/constants";
import StrategyWell from "./StrategyWell";
import DroppableQuadrant from "./DroppableQuadrant";
import { Loader2, ArrowRight, ArrowLeft, GripVertical } from "lucide-react";

export default function StrategyWorkshop() {
  const {
    researchInput,
    researchSections,
    wells,
    setWells,
    grid,
    moveTileToGrid,
    removeTileFromGrid,
    isGeneratingStrategy,
    setIsGeneratingStrategy,
    setCurrentStep,
  } = useAppStore();

  const [activeTile, setActiveTile] = useState<StrategyTile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 8 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // Auto-generate strategy on mount if wells are empty
  useEffect(() => {
    const totalWellTiles = Object.values(wells).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    const totalGridTiles = Object.values(grid).reduce(
      (sum, arr) => sum + arr.length,
      0
    );

    if (totalWellTiles === 0 && totalGridTiles === 0 && researchSections.length > 0) {
      generateStrategy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateStrategy = async () => {
    setError(null);
    setIsGeneratingStrategy(true);

    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ researchInput, researchSections }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Strategy generation failed");
      }

      const data = await res.json();
      setWells(data.wells);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Strategy generation failed";
      setError(message);
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { tile } = event.active.data.current as { tile: StrategyTile };
    setActiveTile(tile);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTile(null);

    const { active, over } = event;
    if (!over) return;

    const { tile, isInGrid, sourceQuadrant } = active.data.current as {
      tile: StrategyTile;
      isInGrid: boolean;
      sourceQuadrant: QuadrantKey;
    };

    const overId = over.id as string;

    // Dropping onto a grid quadrant
    if (overId.startsWith("grid-")) {
      const targetQuadrant = overId.replace("grid-", "") as QuadrantKey;

      // If already in grid, remove first then re-add
      if (isInGrid) {
        removeTileFromGrid(tile.id, sourceQuadrant);
      }

      if (grid[targetQuadrant].length < MAX_TILES_PER_QUADRANT) {
        moveTileToGrid(tile, targetQuadrant);
      }
    }
  };

  const totalInGrid = Object.values(grid).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  if (isGeneratingStrategy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-1">
            Generating Strategy Angles
          </h2>
          <p className="text-muted-foreground text-sm">
            Building 36 messaging options across 4 quadrants...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">The Strategy Workshop</h1>
            <p className="text-muted-foreground text-sm">
              Drag strategies from the wells into the grid. Up to 5 per
              quadrant.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Intel
            </button>
            <div className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{totalInGrid}</span>
              /20 selected
            </div>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={totalInGrid === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              View Playbook
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-lg mb-4">
            {error}
            <button
              onClick={generateStrategy}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Layout: Wells on sides, Grid in center */}
        <div className="grid grid-cols-[280px_1fr_280px] gap-4">
          {/* Left Wells */}
          <div className="space-y-4">
            <StrategyWell quadrantKey="our-story" tiles={wells["our-story"]} />
            <StrategyWell
              quadrantKey="the-counter"
              tiles={wells["the-counter"]}
            />
          </div>

          {/* Central Grid */}
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                "our-story",
                "the-attack",
                "the-counter",
                "their-defense",
              ] as QuadrantKey[]
            ).map((key) => (
              <DroppableQuadrant
                key={key}
                quadrantKey={key}
                tiles={grid[key]}
                onRemoveTile={(tileId) => removeTileFromGrid(tileId, key)}
              />
            ))}
          </div>

          {/* Right Wells */}
          <div className="space-y-4">
            <StrategyWell
              quadrantKey="the-attack"
              tiles={wells["the-attack"]}
            />
            <StrategyWell
              quadrantKey="their-defense"
              tiles={wells["their-defense"]}
            />
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTile ? (
          <div className="drag-overlay flex items-start gap-2 p-3 rounded-lg border bg-card border-primary text-sm max-w-[300px]">
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="leading-snug">{activeTile.text}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
