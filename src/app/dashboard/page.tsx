"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Megaphone,
  ShieldCheck,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  ArrowRight,
  Globe,
} from "lucide-react";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { useOrg } from "@/lib/hooks/use-org";
import type { Campaign, Client } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { currentOrg, isLoading: orgLoading } = useOrg();

  // Campaign data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  // Client data
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // Approvals
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    if (!currentOrg) return;
    async function loadData() {
      try {
        const [campaignsRes, clientsRes] = await Promise.all([
          fetch(`/api/campaigns?org_id=${currentOrg!.id}`),
          fetch(`/api/clients?org_id=${currentOrg!.id}`),
        ]);
        if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
        if (clientsRes.ok) setClients(await clientsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setCampaignsLoading(false);
        setClientsLoading(false);
      }
    }
    loadData();
  }, [currentOrg]);

  const activeCampaigns = campaigns.filter(
    (c) => !["complete", "paused"].includes(c.status)
  );
  const recentCampaigns = campaigns.slice(0, 5);
  const recentClients = clients.slice(0, 5);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentOrg?.name || "Welcome back"}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/clients/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Clients</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {clients.length}
          </p>
        </div>
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
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs">Pending Approvals</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {pendingApprovals}
          </p>
        </div>
      </div>

      {/* Recent Clients */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Clients
          </h2>
          {clients.length > 5 && (
            <button
              onClick={() => router.push("/dashboard/clients")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {clientsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 animate-pulse"
              >
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : recentClients.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No clients yet. Create one to get started.
            </p>
            <button
              onClick={() => router.push("/dashboard/clients/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div
                key={client.id}
                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                className="group bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {client.logo_url ? (
                      <img
                        src={client.logo_url}
                        alt={client.name}
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {client.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {client.industry && <span>{client.industry}</span>}
                        {client.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {client.website.replace(/^https?:\/\//, "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors ml-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Campaigns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Campaigns
          </h2>
          {campaigns.length > 5 && (
            <button
              onClick={() => router.push("/dashboard/campaigns")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {campaignsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border p-5 animate-pulse"
              >
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : recentCampaigns.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No campaigns yet. Create a client and add campaigns.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
