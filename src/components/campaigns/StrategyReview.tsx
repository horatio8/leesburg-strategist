"use client";

import { useState } from "react";
import {
  Target,
  MessageSquare,
  Palette,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Megaphone,
} from "lucide-react";
import type { CampaignStrategy, CreativeConcept } from "@/lib/types";
import StatusBadge from "@/components/shared/StatusBadge";

interface StrategyReviewProps {
  strategy: CampaignStrategy | null;
  concepts: CreativeConcept[];
  onApproveStrategy?: (strategyId: string) => void;
  onApproveConcept?: (conceptId: string) => void;
  onRejectConcept?: (conceptId: string) => void;
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground flex-1">
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

function ConceptCard({
  concept,
  onApprove,
  onReject,
}: {
  concept: CreativeConcept;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon =
    concept.status === "approved" ? (
      <CheckCircle2 className="w-4 h-4 text-green-500" />
    ) : concept.status === "rejected" ? (
      <XCircle className="w-4 h-4 text-red-500" />
    ) : (
      <Clock className="w-4 h-4 text-amber-500" />
    );

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <Palette className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {concept.name}
            </h4>
            {statusIcon}
          </div>
          {concept.copy_tone && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              Tone: {concept.copy_tone}
            </p>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {concept.visual_direction && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Visual Direction
              </span>
              <p className="text-sm text-foreground mt-1">
                {concept.visual_direction}
              </p>
            </div>
          )}

          {concept.headline_angles?.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Headlines
              </span>
              <ul className="mt-1 space-y-1">
                {concept.headline_angles.map((h, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground pl-3 border-l-2 border-primary/30"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {concept.rationale && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rationale
              </span>
              <p className="text-sm text-foreground mt-1">
                {concept.rationale}
              </p>
            </div>
          )}

          {Object.keys(concept.platform_strategy || {}).length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Platform Strategy
              </span>
              <div className="mt-1 space-y-1.5">
                {Object.entries(concept.platform_strategy).map(
                  ([platform, strategy]) => (
                    <div
                      key={platform}
                      className="flex gap-2 text-xs"
                    >
                      <span className="font-medium text-foreground min-w-[80px] capitalize">
                        {platform.replace(/_/g, " ")}:
                      </span>
                      <span className="text-muted-foreground">
                        {String(strategy)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {concept.status === "pending" && (onApprove || onReject) && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {onApprove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(concept.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
              )}
              {onReject && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(concept.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-600 rounded-md text-xs font-medium hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StrategyReview({
  strategy,
  concepts,
  onApproveStrategy,
  onApproveConcept,
  onRejectConcept,
}: StrategyReviewProps) {
  if (!strategy) return null;

  const gridData = strategy.grid_data as Record<string, unknown>;
  const positioning = gridData?.positioning as Record<string, unknown> | undefined;
  const messagingGrid = gridData?.messaging_grid as Record<string, unknown> | undefined;
  const channelStrategy = gridData?.channel_strategy as Record<string, unknown> | undefined;
  const campaignPhases = gridData?.campaign_phases as Array<Record<string, unknown>> | undefined;
  const kpis = gridData?.kpis as Array<Record<string, unknown>> | undefined;

  return (
    <div className="space-y-4">
      {/* Strategy header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={strategy.status} />
          <span className="text-xs text-muted-foreground">
            {new Date(strategy.created_at).toLocaleDateString()}
          </span>
        </div>
        {strategy.status === "draft" && onApproveStrategy && (
          <button
            onClick={() => onApproveStrategy(strategy.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approve Strategy
          </button>
        )}
      </div>

      {/* Positioning */}
      {!!positioning && (
        <CollapsibleSection title="Brand Positioning" icon={Target} defaultOpen>
          {!!positioning.statement && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Positioning Statement
              </span>
              <p className="text-sm text-foreground mt-1 font-medium">
                {String(positioning.statement)}
              </p>
            </div>
          )}
          {!!positioning.value_proposition && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Value Proposition
              </span>
              <p className="text-sm text-foreground mt-1">
                {String(positioning.value_proposition)}
              </p>
            </div>
          )}
          {Array.isArray(positioning.differentiators) &&
            positioning.differentiators.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Key Differentiators
                </span>
                <ul className="mt-1 space-y-1">
                  {(positioning.differentiators as string[]).map((d, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground pl-3 border-l-2 border-primary/30"
                    >
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          {!!positioning.competitive_advantage && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Competitive Advantage
              </span>
              <p className="text-sm text-foreground mt-1">
                {String(positioning.competitive_advantage)}
              </p>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Messaging Grid */}
      {!!messagingGrid && (
        <CollapsibleSection
          title="Messaging Framework"
          icon={MessageSquare}
          defaultOpen
        >
          {!!messagingGrid.primary_message && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Primary Message
              </span>
              <p className="text-sm text-foreground mt-1 font-medium">
                {String(messagingGrid.primary_message)}
              </p>
            </div>
          )}

          {Array.isArray(messagingGrid.supporting_messages) &&
            messagingGrid.supporting_messages.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Supporting Messages
                </span>
                <div className="mt-2 space-y-2">
                  {(
                    messagingGrid.supporting_messages as Array<
                      Record<string, unknown>
                    >
                  ).map((msg, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border"
                    >
                      <p className="text-sm text-foreground font-medium">
                        {String(msg.message || "")}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {!!msg.audience_segment && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {String(msg.audience_segment)}
                          </span>
                        )}
                        {!!msg.tone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {String(msg.tone)}
                          </span>
                        )}
                        {Array.isArray(msg.channels) &&
                          (msg.channels as string[]).map((ch, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {ch}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {Array.isArray(messagingGrid.proof_points) &&
            messagingGrid.proof_points.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Proof Points
                </span>
                <ul className="mt-1 space-y-1">
                  {(messagingGrid.proof_points as string[]).map((p, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground pl-3 border-l-2 border-green-500/30"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(messagingGrid.call_to_action_options) &&
            messagingGrid.call_to_action_options.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Call-to-Action Options
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(messagingGrid.call_to_action_options as string[]).map(
                    (cta, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {cta}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
        </CollapsibleSection>
      )}

      {/* Creative Concepts */}
      {concepts.length > 0 && (
        <CollapsibleSection
          title={`Creative Concepts (${concepts.length})`}
          icon={Palette}
          defaultOpen
        >
          <div className="space-y-3">
            {concepts.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                onApprove={onApproveConcept}
                onReject={onRejectConcept}
              />
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Channel Strategy */}
      {!!channelStrategy && (
        <CollapsibleSection title="Channel Strategy" icon={Megaphone}>
          {Array.isArray(channelStrategy.primary_channels) &&
            channelStrategy.primary_channels.length > 0 && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Primary Channels
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(channelStrategy.primary_channels as string[]).map(
                    (ch, i) => (
                      <span
                        key={i}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground font-medium"
                      >
                        {ch}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

          {!!channelStrategy.channel_roles &&
            typeof channelStrategy.channel_roles === "object" && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Channel Roles
                </span>
                <div className="mt-1 space-y-1.5">
                  {Object.entries(
                    channelStrategy.channel_roles as Record<string, string>
                  ).map(([channel, role]) => (
                    <div key={channel} className="flex gap-2 text-xs">
                      <span className="font-medium text-foreground min-w-[100px] capitalize">
                        {channel.replace(/_/g, " ")}:
                      </span>
                      <span className="text-muted-foreground">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {!!channelStrategy.budget_allocation_recommendation &&
            typeof channelStrategy.budget_allocation_recommendation ===
              "object" && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget Allocation
                </span>
                <div className="mt-1 space-y-1.5">
                  {Object.entries(
                    channelStrategy.budget_allocation_recommendation as Record<
                      string,
                      string
                    >
                  ).map(([channel, alloc]) => (
                    <div key={channel} className="flex gap-2 text-xs">
                      <span className="font-medium text-foreground min-w-[100px] capitalize">
                        {channel.replace(/_/g, " ")}:
                      </span>
                      <span className="text-muted-foreground">{alloc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </CollapsibleSection>
      )}

      {/* Campaign Phases */}
      {Array.isArray(campaignPhases) && campaignPhases.length > 0 && (
        <CollapsibleSection title="Campaign Phases" icon={Layers}>
          <div className="space-y-3">
            {campaignPhases.map((phase, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">
                    {String(phase.phase_name || `Phase ${i + 1}`)}
                  </h4>
                  {!!phase.duration && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
                      {String(phase.duration)}
                    </span>
                  )}
                </div>
                {!!phase.objective && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {String(phase.objective)}
                  </p>
                )}
                {Array.isArray(phase.key_activities) &&
                  phase.key_activities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {(phase.key_activities as string[]).map((act, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* KPIs */}
      {Array.isArray(kpis) && kpis.length > 0 && (
        <CollapsibleSection title="Key Performance Indicators" icon={BarChart3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-border"
              >
                <p className="text-sm font-medium text-foreground">
                  {String(kpi.metric || "")}
                </p>
                {!!kpi.target && (
                  <p className="text-xs text-primary mt-0.5">
                    Target: {String(kpi.target)}
                  </p>
                )}
                {!!kpi.measurement_method && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {String(kpi.measurement_method)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
