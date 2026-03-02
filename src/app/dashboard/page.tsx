"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Megaphone,
  ShieldCheck,
  Palette,
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  ArrowRight,
  MapPin,
  Trash2,
} from "lucide-react";
import CampaignCard from "@/components/campaigns/CampaignCard";
import { useOrg } from "@/lib/hooks/use-org";
import type { Campaign, Approval, MessagingFramework } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { currentOrg, isLoading: orgLoading } = useOrg();

  // Campaign data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  // Legacy frameworks
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [frameworksLoading, setFrameworksLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Approvals
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    if (!currentOrg) return;
    async function loadCampaigns() {
      try {
        const res = await fetch(`/api/campaigns?org_id=${currentOrg!.id}`);
        if (res.ok) setCampaigns(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setCampaignsLoading(false);
      }
    }
    loadCampaigns();
  }, [currentOrg]);

  useEffect(() => {
    async function loadFrameworks() {
      try {
        const res = await fetch("/api/frameworks");
        if (res.ok) setFrameworks(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setFrameworksLoading(false);
      }
    }
    loadFrameworks();
  }, []);

  const handleCreateFramework = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/frameworks", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/framework/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFramework = async (id: string) => {
    if (!confirm("Are you sure you want to delete this framework?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/frameworks/${id}`, { method: "DELETE" });
      if (res.ok) setFrameworks((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-slate-500/10 text-slate-400",
      in_progress: "bg-amber-500/10 text-amber-400",
      complete: "bg-green-500/10 text-green-400",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      in_progress: "In Progress",
      complete: "Complete",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}
      >
        {labels[status] || "Draft"}
      </span>
    );
  };

  const stepLabel = (step: number) => {
    const labels = ["", "Your Campaign", "Preliminary Research", "Strategy Workshop", "Final Playbook"];
    return labels[step] || "Your Campaign";
  };

  const activeCampaigns = campaigns.filter(
    (c) => !["complete", "paused"].includes(c.status)
  );
  const recentCampaigns = campaigns.slice(0, 5);

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
          onClick={() => router.push("/dashboard/campaigns/new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs">Frameworks</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {frameworks.length}
          </p>
        </div>
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
            <p className="text-sm text-muted-foreground mb-3">
              No campaigns yet. Create one to get started.
            </p>
            <button
              onClick={() => router.push("/dashboard/campaigns/new")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        )}
      </div>

      {/* Messaging Frameworks (Legacy) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            Messaging Frameworks
          </h2>
          <button
            onClick={handleCreateFramework}
            disabled={creating}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {creating ? "Creating..." : "New Framework"}
          </button>
        </div>
        {frameworksLoading ? (
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
        ) : frameworks.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No messaging frameworks yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {frameworks.slice(0, 3).map((fw) => (
              <div
                key={fw.id}
                className="group bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => router.push(`/framework/${fw.id}`)}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-semibold text-foreground truncate">
                        {fw.name?.trim() || fw.title || "Untitled Framework"}
                      </h3>
                      {statusBadge(fw.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {fw.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {fw.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(fw.updated_at)}
                      </span>
                      <span>Step: {stepLabel(fw.current_step)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFramework(fw.id);
                      }}
                      disabled={deletingId === fw.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
