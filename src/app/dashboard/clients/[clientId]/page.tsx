"use client";

import { useParams, useRouter } from "next/navigation";
import { Plus, Megaphone, Globe, FileText, Clock } from "lucide-react";
import { useClient } from "@/lib/hooks/use-client";
import CampaignCard from "@/components/campaigns/CampaignCard";

export default function ClientOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const { client, campaigns } = useClient(clientId);

  if (!client) return null;

  const activeCampaigns = campaigns.filter(
    (c) => !["complete", "paused"].includes(c.status)
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Megaphone className="w-4 h-4" />
            <span className="text-xs">Campaigns</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {campaigns.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Active</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {activeCampaigns.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs">Website</span>
          </div>
          <p className="text-sm font-medium text-foreground truncate">
            {client.website?.replace(/^https?:\/\//, "") || "—"}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-8">
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

      {/* Client Notes */}
      {client.notes && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </h2>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        </div>
      )}

      {/* Recent Campaigns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Campaigns
          </h2>
          {campaigns.length > 3 && (
            <button
              onClick={() =>
                router.push(`/dashboard/clients/${clientId}/campaigns`)
              }
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
            </button>
          )}
        </div>
        {campaigns.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No campaigns yet for this client.
            </p>
            <button
              onClick={() =>
                router.push(`/dashboard/clients/${clientId}/campaigns/new`)
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
