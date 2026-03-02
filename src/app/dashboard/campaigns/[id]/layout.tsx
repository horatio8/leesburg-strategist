"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Search,
  Lightbulb,
  Palette,
  ScrollText,
  Loader2,
} from "lucide-react";
import CampaignPhaseTracker from "@/components/campaigns/CampaignPhaseTracker";
import StatusBadge from "@/components/shared/StatusBadge";
import type { Campaign } from "@/lib/types";

const NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/research", label: "Research", icon: Search },
  { href: "/strategy", label: "Strategy", icon: Lightbulb },
  { href: "/creative", label: "Creative", icon: Palette },
  { href: "/decisions", label: "Decisions", icon: ScrollText },
];

export default function CampaignDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const campaignId = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (res.ok) setCampaign(await res.json());
      } catch (err) {
        console.error("Failed to load campaign:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Link
          href="/dashboard/campaigns"
          className="text-primary text-sm mt-2 inline-block"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  const basePath = `/dashboard/campaigns/${campaignId}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Campaigns
      </Link>

      {/* Campaign header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              {campaign.name}
            </h1>
            <StatusBadge status={campaign.status} />
            {campaign.priority === "high" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                High
              </span>
            )}
          </div>
          {campaign.brief?.brand_name && (
            <p className="text-sm text-muted-foreground">
              {campaign.brief.brand_name}
              {campaign.brief.industry && ` · ${campaign.brief.industry}`}
            </p>
          )}
        </div>
        <CampaignPhaseTracker
          status={campaign.status}
          currentPhase={campaign.phase}
        />
      </div>

      {/* Subnav */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {NAV_ITEMS.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(href);

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
