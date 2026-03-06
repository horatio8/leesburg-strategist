"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Loader2, Palette, Check, AlertCircle } from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import type { BrandKit } from "@/lib/types";

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  draft: { label: "Draft", class: "bg-amber-500/10 text-amber-400" },
  active: { label: "Active", class: "bg-emerald-500/10 text-emerald-400" },
  archived: { label: "Archived", class: "bg-muted text-muted-foreground" },
};

export default function CampaignBrandKitsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOrg } = useOrg();
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id || !currentOrg) return;
      try {
        const res = await fetch(
          `/api/brand-kits?org_id=${currentOrg.id}&campaign_id=${id}`
        );
        if (res.ok) {
          setBrandKits(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentOrg]);

  const handleCreate = async () => {
    if (!currentOrg || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/brand-kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: currentOrg.id,
          campaign_id: id,
          name: "New Brand Kit",
        }),
      });
      if (res.ok) {
        const created = await res.json();
        router.push(`/dashboard/brand-kits/${created.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeKits = brandKits.filter((k) => k.status === "active");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Brand Kits</h2>
          <p className="text-sm text-muted-foreground">
            Brand identities for this campaign. Active kits can be used for
            creative generation.
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {creating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Create Brand Kit
        </button>
      </div>

      {/* Readiness indicator */}
      {brandKits.length > 0 && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm ${
            activeKits.length > 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {activeKits.length > 0 ? (
            <>
              <Check className="w-4 h-4" />
              {activeKits.length} active brand kit{activeKits.length !== 1 ? "s" : ""} ready for creative generation
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              No active brand kits yet. Set a kit&apos;s status to &quot;Active&quot; when it&apos;s ready.
            </>
          )}
        </div>
      )}

      {/* Brand Kit Grid */}
      {brandKits.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Palette className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No brand kits yet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a brand kit to define colors, fonts, voice, and logos for
            this campaign.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Brand Kit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandKits.map((kit) => {
            const badge = STATUS_BADGE[kit.status] || STATUS_BADGE.draft;
            const colorValues = Object.values(kit.colors || {});

            return (
              <button
                key={kit.id}
                onClick={() =>
                  router.push(`/dashboard/brand-kits/${kit.id}`)
                }
                className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 transition-colors group"
              >
                {/* Color strip */}
                {colorValues.length > 0 && (
                  <div className="flex rounded-lg overflow-hidden h-8 mb-4 border border-border">
                    {colorValues.slice(0, 6).map((color, i) => (
                      <div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {kit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                      {kit.source && kit.source !== "manual" && (
                        <span className="text-[10px] text-muted-foreground">
                          {kit.source === "extracted"
                            ? "Extracted"
                            : "AI Generated"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-muted-foreground">
                    <p>{Object.keys(kit.colors || {}).length} colors</p>
                    <p>{Object.keys(kit.fonts || {}).length} fonts</p>
                    {kit.logo_urls?.length > 0 && (
                      <p>{kit.logo_urls.length} logos</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
