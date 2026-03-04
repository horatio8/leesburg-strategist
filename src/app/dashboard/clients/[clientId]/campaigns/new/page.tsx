"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CampaignBriefForm from "@/components/campaigns/CampaignBriefForm";
import { useOrg } from "@/lib/hooks/use-org";
import { useClient } from "@/lib/hooks/use-client";
import { Loader2 } from "lucide-react";

export default function NewCampaignForClientPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const { currentOrg, isLoading: orgLoading } = useOrg();
  const { client, isLoading: clientLoading } = useClient(clientId);

  if (orgLoading || clientLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!currentOrg || !client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/clients/${clientId}/campaigns`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {client.name} Campaigns
      </Link>

      <h2 className="text-xl font-bold text-foreground mb-6">
        New Campaign for {client.name}
      </h2>

      <CampaignBriefForm orgId={currentOrg.id} clientId={clientId} />
    </div>
  );
}
