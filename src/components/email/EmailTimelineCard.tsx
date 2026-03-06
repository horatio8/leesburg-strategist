"use client";

import { Calendar, Mail, ChevronRight } from "lucide-react";
import type { EmailCampaignEmail } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  appeal: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "thank-you": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  reminder: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  event: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

interface EmailTimelineCardProps {
  email: EmailCampaignEmail;
  onClick?: () => void;
}

export default function EmailTimelineCard({
  email,
  onClick,
}: EmailTimelineCardProps) {
  const typeColor = TYPE_COLORS[email.email_type] || TYPE_COLORS.appeal;
  const statusColor = STATUS_COLORS[email.status] || STATUS_COLORS.draft;

  const formattedDate = email.send_date
    ? new Date(email.send_date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "No date set";

  const previewSnippet =
    (email.introduction || email.body || "").slice(0, 120) +
    ((email.introduction || email.body || "").length > 120 ? "..." : "");

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {/* Sequence indicator */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
            {email.sequence_number}
          </div>
          <div className="w-px h-full bg-border mt-2 min-h-[20px]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Date & badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${typeColor}`}
            >
              {email.email_type}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColor}`}
            >
              {email.status}
            </span>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <h4 className="text-sm font-semibold text-foreground truncate">
              {email.subject || "Untitled Email"}
            </h4>
          </div>

          {/* Preview snippet */}
          {previewSnippet && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {previewSnippet}
            </p>
          )}

          {/* CTA preview */}
          {email.cta_text && (
            <p className="text-[10px] text-primary font-medium">
              CTA: {email.cta_text}
            </p>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}
