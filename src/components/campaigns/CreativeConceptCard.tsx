"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Image,
  Type,
  Video,
  ExternalLink,
} from "lucide-react";
import type { Creative } from "@/lib/types";
import StatusBadge from "@/components/shared/StatusBadge";

const typeIcons: Record<string, React.ElementType> = {
  copy: Type,
  image: Image,
  video: Video,
};

const platformLabels: Record<string, string> = {
  meta_feed: "Meta Feed",
  meta_stories: "Meta Stories",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X / Twitter",
  multi: "Multi-platform",
};

interface CreativeConceptCardProps {
  creative: Creative;
}

export default function CreativeConceptCard({
  creative,
}: CreativeConceptCardProps) {
  const [expanded, setExpanded] = useState(false);

  const content = creative.content as Record<string, unknown>;
  const visualBrief = content?.visual_brief as Record<string, unknown> | undefined;
  const variations = content?.variations as Array<Record<string, unknown>> | undefined;

  const Icon = typeIcons[creative.type] || Type;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {platformLabels[creative.platform || "multi"] || creative.platform}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {creative.type}
            </span>
            <StatusBadge status={creative.status} />
          </div>
          {!!content?.headline && (
            <p className="text-sm font-medium text-foreground truncate">
              {String(content.headline)}
            </p>
          )}
          {!!content?.body_copy && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {String(content.body_copy)}
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
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          {/* Copy content */}
          <div className="space-y-2">
            {!!content?.headline && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Headline
                </span>
                <p className="text-sm text-foreground font-medium mt-1">
                  {String(content.headline)}
                </p>
              </div>
            )}
            {!!content?.body_copy && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Body Copy
                </span>
                <p className="text-sm text-foreground mt-1 whitespace-pre-line">
                  {String(content.body_copy)}
                </p>
              </div>
            )}
            {!!content?.cta && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Call to Action
                </span>
                <span className="inline-block mt-1 text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground font-medium">
                  {String(content.cta)}
                </span>
              </div>
            )}
            {!!content?.description && (
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  {String(content.description)}
                </p>
              </div>
            )}
            {Array.isArray(content?.hashtags) &&
              (content.hashtags as string[]).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(content.hashtags as string[]).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* Visual brief */}
          {!!visualBrief && (
            <div className="p-3 bg-muted/30 rounded-lg space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Visual Brief
              </span>
              {!!visualBrief.description && (
                <p className="text-sm text-foreground">
                  {String(visualBrief.description)}
                </p>
              )}
              {!!visualBrief.mood && (
                <p className="text-xs text-muted-foreground">
                  Mood: {String(visualBrief.mood)}
                </p>
              )}
              {!!visualBrief.aspect_ratio && (
                <p className="text-xs text-muted-foreground">
                  Aspect Ratio: {String(visualBrief.aspect_ratio)}
                </p>
              )}
              {Array.isArray(visualBrief.color_palette) &&
                (visualBrief.color_palette as string[]).length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Colors:</span>
                    {(visualBrief.color_palette as string[]).map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                )}
              {!!visualBrief.image_generation_prompt && (
                <div className="mt-2 p-2 bg-background rounded border border-border">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Image Gen Prompt
                  </span>
                  <p className="text-xs text-foreground mt-1 font-mono">
                    {String(visualBrief.image_generation_prompt)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Variations */}
          {Array.isArray(variations) && variations.length > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                A/B Variations
              </span>
              <div className="mt-2 space-y-2">
                {variations.map((v, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-dashed border-border"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                        {String(v.label || `Variation ${i + 1}`)}
                      </span>
                    </div>
                    {!!v.headline && (
                      <p className="text-sm font-medium text-foreground">
                        {String(v.headline)}
                      </p>
                    )}
                    {!!v.body_copy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {String(v.body_copy)}
                      </p>
                    )}
                    {!!v.rationale && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">
                        {String(v.rationale)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canva link */}
          {creative.canva_edit_url && (
            <a
              href={creative.canva_edit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Edit in Canva
            </a>
          )}
        </div>
      )}
    </div>
  );
}
