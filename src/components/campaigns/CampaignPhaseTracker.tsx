"use client";

import { Check } from "lucide-react";
import type { CampaignStatus } from "@/lib/types";

const phases = [
  { key: "draft", label: "Brief", phase: 0 },
  { key: "researching", label: "Research", phase: 1 },
  { key: "ideation", label: "Strategy", phase: 2 },
  { key: "creating", label: "Creative", phase: 3 },
  { key: "review", label: "Review", phase: 4 },
  { key: "deployed", label: "Deploy", phase: 5 },
];

interface CampaignPhaseTrackerProps {
  status: CampaignStatus;
  currentPhase: number;
}

export default function CampaignPhaseTracker({
  status,
  currentPhase,
}: CampaignPhaseTrackerProps) {
  const isPaused = status === "paused";
  const isComplete = status === "complete";

  return (
    <div className="flex items-center gap-1">
      {phases.map((phase, i) => {
        const isActive = phase.phase === currentPhase && !isComplete;
        const isDone = phase.phase < currentPhase || isComplete;

        return (
          <div key={phase.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                      ? isPaused
                        ? "bg-orange-500/20 text-orange-400 ring-2 ring-orange-500/30"
                        : "bg-primary/20 text-primary ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {phase.label}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div
                className={`w-6 h-0.5 mx-0.5 mt-[-12px] ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
