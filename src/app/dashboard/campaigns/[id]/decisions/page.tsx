"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  RefreshCw,
  ScrollText,
  Bot,
  ChevronDown,
  ChevronRight,
  Shield,
  AlertTriangle,
} from "lucide-react";
import type { DecisionLog } from "@/lib/types";

const agentColors: Record<string, string> = {
  "research-agent": "bg-blue-500/10 text-blue-700 border-blue-200",
  "strategy-agent": "bg-purple-500/10 text-purple-700 border-purple-200",
  "creative-agent": "bg-amber-500/10 text-amber-700 border-amber-200",
};

const agentLabels: Record<string, string> = {
  "research-agent": "Research Agent",
  "strategy-agent": "Strategy Agent",
  "creative-agent": "Creative Agent",
};

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 70
      ? "bg-emerald-500"
      : pct >= 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

function DecisionCard({ decision }: { decision: DecisionLog }) {
  const [expanded, setExpanded] = useState(false);

  const agentStyle =
    agentColors[decision.agent] ||
    "bg-muted text-muted-foreground border-border";
  const agentLabel = agentLabels[decision.agent] || decision.agent;

  const evidence = decision.evidence || {};
  const evidenceEntries = Object.entries(evidence);
  const alternatives = decision.alternatives_considered || [];

  const timestamp = new Date(decision.created_at);
  const timeStr = timestamp.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${agentStyle}`}
            >
              {agentLabel}
            </span>
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
              {decision.decision_type.replace(/_/g, " ")}
            </span>
            {decision.reversible && (
              <span title="Reversible"><Shield className="w-3 h-3 text-muted-foreground" /></span>
            )}
          </div>
          <p className="text-sm text-foreground">{decision.decision}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-24">
              <ConfidenceBar value={decision.confidence} />
            </div>
            <span className="text-[10px] text-muted-foreground">{timeStr}</span>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* Reasoning */}
          {decision.reasoning && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Reasoning
              </span>
              <p className="text-sm text-foreground mt-1 whitespace-pre-line">
                {decision.reasoning}
              </p>
            </div>
          )}

          {/* Evidence */}
          {evidenceEntries.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Evidence
              </span>
              <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {evidenceEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 bg-muted/30 rounded-lg"
                  >
                    <p className="text-[10px] text-muted-foreground">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {typeof value === "boolean"
                        ? value
                          ? "Yes"
                          : "No"
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives considered */}
          {alternatives.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alternatives Considered
              </span>
              <div className="mt-1.5 space-y-1.5">
                {alternatives.map((alt, i) => (
                  <div
                    key={i}
                    className="p-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground"
                  >
                    {typeof alt === "string"
                      ? alt
                      : JSON.stringify(alt, null, 2)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
            <span>
              Confidence: {Math.round(decision.confidence * 100)}%
            </span>
            <span>
              {decision.reversible ? "Reversible" : "Irreversible"}
            </span>
            <span>
              {timestamp.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CampaignDecisionsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [decisions, setDecisions] = useState<DecisionLog[]>([]);
  const [filterAgent, setFilterAgent] = useState<string>("all");

  const loadDecisions = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/campaigns/${id}/decisions`);
      if (res.ok) {
        const data = await res.json();
        setDecisions(Array.isArray(data) ? data : []);
      }
    } catch {
      // Will fall through to empty state
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDecisions();
  }, [loadDecisions]);

  const agents = [...new Set(decisions.map((d) => d.agent))];

  const filtered =
    filterAgent === "all"
      ? decisions
      : decisions.filter((d) => d.agent === filterAgent);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Decisions Log
          </h2>
          <p className="text-sm text-muted-foreground">
            Transparent record of all AI agent decisions, reasoning, and evidence
          </p>
        </div>
        <div className="flex items-center gap-2">
          {agents.length > 1 && (
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground"
            >
              <option value="all">All Agents</option>
              {agents.map((a) => (
                <option key={a} value={a}>
                  {agentLabels[a] || a}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={loadDecisions}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {decisions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {decisions.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Decisions</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{agents.length}</p>
            <p className="text-xs text-muted-foreground">Agents Active</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {Math.round(
                (decisions.reduce((sum, d) => sum + d.confidence, 0) /
                  decisions.length) *
                  100
              )}
              %
            </p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {decisions.filter((d) => d.reversible).length}
            </p>
            <p className="text-xs text-muted-foreground">Reversible</p>
          </div>
        </div>
      )}

      {/* Decision list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <ScrollText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No Decisions Yet
          </h3>
          <p className="text-xs text-muted-foreground">
            Decisions will appear here as AI agents process your campaign
            through research, strategy, and creative phases.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No decisions match the current filter.
          </p>
        </div>
      )}
    </div>
  );
}
