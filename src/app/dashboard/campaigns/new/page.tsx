"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CampaignBriefForm from "@/components/campaigns/CampaignBriefForm";
import { useOrg } from "@/lib/hooks/use-org";
import { Loader2 } from "lucide-react";

export default function NewCampaignPage() {
  const { currentOrg, isLoading } = useOrg();

  if (isLoading || !currentOrg) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">
        Create Campaign
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Fill in your campaign brief to get started
      </p>

      <CampaignBriefForm orgId={currentOrg.id} />
    </div>
  );
}
