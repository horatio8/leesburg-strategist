"use client";

import Link from "next/link";
import { Clock, ChevronRight, Target } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Campaign } from "@/lib/types";

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const platformCount = campaign.platforms?.length || 0;

  return (
    <Link
      href={`/dashboard/campaigns/${campaign.id}`}
      className="group block bg-card rounded-xl border border-border hover:border-primary/30 transition-all"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-semibold text-foreground truncate">
              {campaign.name}
            </h3>
            <StatusBadge status={campaign.status} />
            {campaign.priority === "high" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                High
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {formatDate(campaign.updated_at)}
            </span>
            {platformCount > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                {platformCount} platform{platformCount !== 1 ? "s" : ""}
              </span>
            )}
            {campaign.brief?.brand_name && (
              <span className="truncate max-w-[200px]">
                {campaign.brief.brand_name}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors ml-4 shrink-0" />
      </div>
    </Link>
  );
}
