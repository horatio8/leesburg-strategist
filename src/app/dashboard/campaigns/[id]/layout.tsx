import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import CampaignPhaseTracker from "@/components/campaigns/CampaignPhaseTracker";
import StatusBadge from "@/components/shared/StatusBadge";
import CampaignDetailNav from "@/components/campaigns/CampaignDetailNav";
import type { Campaign } from "@/lib/types";

export default async function CampaignDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: campaignId } = await params;
  const admin = createServiceClient();

  const { data: campaign, error } = await admin
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (error || !campaign) {
    notFound();
  }

  const typedCampaign = campaign as Campaign;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Campaign header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              {typedCampaign.name}
            </h1>
            <StatusBadge status={typedCampaign.status} />
            {typedCampaign.priority === "high" && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">
                High
              </span>
            )}
          </div>
          {typedCampaign.brief?.brand_name && (
            <p className="text-sm text-muted-foreground">
              {typedCampaign.brief.brand_name}
              {typedCampaign.brief.industry &&
                ` · ${typedCampaign.brief.industry}`}
            </p>
          )}
        </div>
        <CampaignPhaseTracker
          status={typedCampaign.status}
          currentPhase={typedCampaign.phase}
        />
      </div>

      {/* Subnav (client component — needs usePathname) */}
      <CampaignDetailNav campaignId={campaignId} />

      {/* Content — renders immediately, no waterfall */}
      {children}
    </div>
  );
}
