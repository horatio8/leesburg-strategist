"use client";

import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { Job } from "@/lib/types";

const statusConfig: Record<
  string,
  { icon: typeof Clock; color: string; label: string; animate?: boolean }
> = {
  pending: {
    icon: Clock,
    color: "text-amber-400",
    label: "Queued",
  },
  running: {
    icon: Loader2,
    color: "text-blue-400",
    label: "Running",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    label: "Complete",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    label: "Failed",
  },
};

interface JobProgressProps {
  job: Job;
  compact?: boolean;
}

export default function JobProgress({ job, compact = false }: JobProgressProps) {
  const config = statusConfig[job.status];
  const Icon = config.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs ${config.color}`}>
        <Icon
          className={`w-3 h-3 ${config.animate ? "animate-spin" : ""}`}
        />
        {config.label}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
      <Icon
        className={`w-5 h-5 ${config.color} ${config.animate ? "animate-spin" : ""}`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {job.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
        <p className="text-xs text-muted-foreground">
          {config.label}
          {job.error && ` — ${job.error}`}
        </p>
      </div>
    </div>
  );
}
