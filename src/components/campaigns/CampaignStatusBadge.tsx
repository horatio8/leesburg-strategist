"use client";

import type { CampaignStatus } from "@/lib/types";

const statusConfig: Record<
  CampaignStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  draft: { label: "Draft", color: "text-slate-400", bg: "bg-slate-500/10", dot: "bg-slate-400" },
  researching: { label: "Researching", color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  ideation: { label: "Ideation", color: "text-violet-400", bg: "bg-violet-500/10", dot: "bg-violet-400" },
  creating: { label: "Creating", color: "text-indigo-400", bg: "bg-indigo-500/10", dot: "bg-indigo-400" },
  review: { label: "In Review", color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  deployed: { label: "Deployed", color: "text-green-400", bg: "bg-green-500/10", dot: "bg-green-400" },
  monitoring: { label: "Monitoring", color: "text-teal-400", bg: "bg-teal-500/10", dot: "bg-teal-400" },
  paused: { label: "Paused", color: "text-orange-400", bg: "bg-orange-500/10", dot: "bg-orange-400" },
  complete: { label: "Complete", color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  showDot?: boolean;
  className?: string;
}

export default function CampaignStatusBadge({
  status,
  showDot = true,
  className = "",
}: CampaignStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}
