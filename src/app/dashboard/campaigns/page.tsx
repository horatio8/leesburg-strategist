"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Loader2, Megaphone } from "lucide-react";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { useOrg } from "@/lib/hooks/use-org";
import type { Campaign, CampaignStatus } from "@/lib/types";

const STATUS_FILTERS: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "researching", label: "Researching" },
  { value: "ideation", label: "Ideation" },
  { value: "creating", label: "Creating" },
  { value: "review", label: "In Review" },
  { value: "deployed", label: "Deployed" },
  { value: "monitoring", label: "Monitoring" },
  { value: "complete", label: "Complete" },
];

export default function CampaignsListPage() {
  const router = useRouter();
  const { currentOrg, isLoading: orgLoading } = useOrg();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  useEffect(() => {
    if (!currentOrg) return;

    async function fetchCampaigns() {
      try {
        const params = new URLSearchParams({ org_id: currentOrg!.id });
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/campaigns?${params}`);
        if (res.ok) {
          setCampaigns(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchCampaigns();
  }, [currentOrg, statusFilter]);

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your marketing campaigns
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/campaigns/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
            className="pl-9 pr-8 py-2 bg-background border border-border rounded-lg text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaign List */}
      {loading ? (
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
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Megaphone className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {search || statusFilter !== "all"
              ? "No campaigns match your filters"
              : "No campaigns yet"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first campaign to get started"}
          </p>
          {!search && statusFilter === "all" && (
            <button
              onClick={() => router.push("/dashboard/campaigns/new")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  );
}
