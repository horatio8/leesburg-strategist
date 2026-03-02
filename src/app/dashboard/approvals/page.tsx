"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  MessageSquare,
  X,
  ChevronDown,
  Bot,
} from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Approval } from "@/lib/types";

const typeLabels: Record<string, string> = {
  concept: "Creative Concept",
  creative: "Creative Asset",
  strategy: "Strategy",
  deployment: "Deployment",
  optimization: "Optimization",
};

function ApprovalCard({
  approval,
  onResolve,
}: {
  approval: Approval;
  onResolve: (
    id: string,
    status: "approved" | "rejected",
    feedback?: string
  ) => Promise<void>;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState<"approved" | "rejected" | null>(
    null
  );

  const handleAction = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !showFeedback) {
      setShowFeedback(true);
      return;
    }
    setSubmitting(status);
    try {
      await onResolve(approval.id, status, feedback || undefined);
    } finally {
      setSubmitting(null);
      setShowFeedback(false);
      setFeedback("");
    }
  };

  const isPending = approval.status === "pending";
  const time = new Date(approval.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {typeLabels[approval.type] || approval.type}
              </span>
              <StatusBadge status={approval.status} />
              {approval.campaign && (
                <span className="text-[10px] text-muted-foreground">
                  {approval.campaign.name}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {approval.item_summary || "Pending review"}
            </p>
            {approval.agent_reasoning && (
              <div className="flex items-start gap-1.5 mt-2">
                <Bot className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {approval.agent_reasoning}
                </p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-2">{time}</p>

            {/* Show existing feedback if resolved */}
            {approval.feedback && !isPending && (
              <div className="mt-3 p-2.5 bg-muted/30 rounded-lg border border-border">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Feedback
                </p>
                <p className="text-xs text-foreground">{approval.feedback}</p>
              </div>
            )}
          </div>

          {isPending && (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => handleAction("approved")}
                disabled={submitting !== null}
                className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                title="Approve"
              >
                {submitting === "approved" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => handleAction("rejected")}
                disabled={submitting !== null}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                title="Reject"
              >
                {submitting === "rejected" && !showFeedback ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback input (shown when rejecting or optionally when approving) */}
      {showFeedback && isPending && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground mt-2 shrink-0" />
            <div className="flex-1">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add feedback for the agent (optional for approval, recommended for rejection)..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={submitting !== null}
                  className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {submitting === "rejected" ? (
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  ) : null}
                  Reject
                </button>
                <button
                  onClick={() => {
                    // Allow approving with feedback too
                    handleAction("approved");
                  }}
                  disabled={submitting !== null}
                  className="px-3 py-1.5 text-xs font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  {submitting === "approved" ? (
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                  ) : null}
                  Approve with Feedback
                </button>
                <button
                  onClick={() => {
                    setShowFeedback(false);
                    setFeedback("");
                  }}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export default function ApprovalsPage() {
  const { currentOrg, isLoading: orgLoading } = useOrg();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");

  const loadApprovals = useCallback(async () => {
    if (!currentOrg) return;
    try {
      const params = new URLSearchParams({ org_id: currentOrg.id });
      if (filterStatus !== "all") {
        params.set("status", filterStatus);
      }
      const res = await fetch(`/api/approvals?${params}`);
      if (res.ok) {
        setApprovals(await res.json());
      }
    } catch {
      // Will fall through to empty state
    } finally {
      setLoading(false);
    }
  }, [currentOrg, filterStatus]);

  useEffect(() => {
    setLoading(true);
    loadApprovals();
  }, [loadApprovals]);

  const handleResolve = async (
    id: string,
    status: "approved" | "rejected",
    feedback?: string
  ) => {
    const body: Record<string, string> = { status };
    if (feedback) {
      body.feedback = feedback;
    }

    const res = await fetch(`/api/approvals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // Update local state — remove from list if filtering pending, otherwise update in place
      if (filterStatus === "pending") {
        setApprovals((prev) => prev.filter((a) => a.id !== id));
      } else {
        const updated = await res.json();
        setApprovals((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
        );
      }
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve AI-generated content and strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {filterStatus === "pending"
              ? "No pending approvals"
              : `No ${filterStatus} approvals`}
          </h2>
          <p className="text-muted-foreground text-sm">
            {filterStatus === "pending"
              ? "When AI agents generate content or strategies, items requiring your review will appear here."
              : "Try changing the filter to see other approvals."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onResolve={handleResolve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
