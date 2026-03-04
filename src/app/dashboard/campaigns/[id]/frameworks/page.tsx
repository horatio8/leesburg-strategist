"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  Loader2,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import type { MessagingFramework } from "@/lib/types";
import { useOrg } from "@/lib/hooks/use-org";

export default function CampaignFrameworksPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { currentOrg } = useOrg();

  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/frameworks?campaign_id=${campaignId}`);
        if (res.ok) setFrameworks(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/frameworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: campaignId,
          org_id: currentOrg?.id,
        }),
      });
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
    const labels = [
      "",
      "Your Campaign",
      "Preliminary Research",
      "Strategy Workshop",
      "Final Playbook",
    ];
    return labels[step] || "Your Campaign";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Messaging Frameworks
        </h2>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {creating ? "Creating..." : "New Framework"}
        </button>
      </div>

      {frameworks.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            No messaging frameworks for this campaign yet.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Framework
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className="group bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => router.push(`/framework/${fw.id}`)}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-foreground truncate">
                      {fw.title?.trim() || fw.name?.trim() || "Untitled Framework"}
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
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors ml-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
