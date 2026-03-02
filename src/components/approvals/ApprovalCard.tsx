"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Approval } from "@/lib/types";

interface ApprovalCardProps {
  approval: Approval;
  onResolve?: (id: string, status: "approved" | "rejected", feedback?: string) => void;
}

export default function ApprovalCard({ approval, onResolve }: ApprovalCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [resolving, setResolving] = useState<"approved" | "rejected" | null>(null);

  const handleResolve = async (status: "approved" | "rejected") => {
    if (!onResolve) return;
    setResolving(status);
    try {
      await onResolve(approval.id, status, feedback || undefined);
    } finally {
      setResolving(null);
      setShowFeedback(false);
      setFeedback("");
    }
  };

  const isPending = approval.status === "pending";

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
              {approval.type}
            </span>
            <StatusBadge status={approval.status} />
            {approval.campaign && (
              <span className="text-xs text-muted-foreground">
                in {approval.campaign.name}
              </span>
            )}
          </div>

          <p className="text-sm text-foreground">
            {approval.item_summary || "Pending review"}
          </p>

          {approval.agent_reasoning && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-3">
              <span className="font-medium">AI Reasoning:</span>{" "}
              {approval.agent_reasoning}
            </p>
          )}

          {approval.feedback && (
            <p className="text-xs text-muted-foreground mt-1.5 italic">
              <span className="font-medium">Feedback:</span>{" "}
              {approval.feedback}
            </p>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            {new Date(approval.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
            {approval.resolved_at && (
              <span>
                {" "}
                &middot; Resolved{" "}
                {new Date(approval.resolved_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </p>
        </div>

        {isPending && onResolve && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
              title="Add feedback"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleResolve("approved")}
              disabled={resolving !== null}
              className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors disabled:opacity-50"
              title="Approve"
            >
              {resolving === "approved" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => handleResolve("rejected")}
              disabled={resolving !== null}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              title="Reject"
            >
              {resolving === "rejected" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </button>
          </div>
        )}
      </div>

      {showFeedback && isPending && (
        <div className="mt-3 pt-3 border-t border-border">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional feedback or notes..."
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
