"use client";

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-slate-500/10", text: "text-slate-400" },
  researching: { bg: "bg-blue-500/10", text: "text-blue-400" },
  ideation: { bg: "bg-violet-500/10", text: "text-violet-400" },
  creating: { bg: "bg-indigo-500/10", text: "text-indigo-400" },
  review: { bg: "bg-amber-500/10", text: "text-amber-400" },
  deployed: { bg: "bg-green-500/10", text: "text-green-400" },
  monitoring: { bg: "bg-teal-500/10", text: "text-teal-400" },
  paused: { bg: "bg-orange-500/10", text: "text-orange-400" },
  complete: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400" },
  running: { bg: "bg-blue-500/10", text: "text-blue-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  failed: { bg: "bg-red-500/10", text: "text-red-400" },
  approved: { bg: "bg-green-500/10", text: "text-green-400" },
  rejected: { bg: "bg-red-500/10", text: "text-red-400" },
  active: { bg: "bg-green-500/10", text: "text-green-400" },
  archived: { bg: "bg-slate-500/10", text: "text-slate-400" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.draft;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${className}`}
    >
      {label}
    </span>
  );
}
