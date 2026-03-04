"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, Megaphone } from "lucide-react";
import { useClient } from "@/lib/hooks/use-client";
import CampaignCard from "@/components/campaigns/CampaignCard";

export default function ClientCampaignsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const { campaigns, isLoading } = useClient(clientId);

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Campaigns</h2>
        <button
          onClick={() =>
            router.push(`/dashboard/clients/${clientId}/campaigns/new`)
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No campaigns yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a campaign to start marketing for this client
          </p>
          <button
            onClick={() =>
              router.push(`/dashboard/clients/${clientId}/campaigns/new`)
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
