"use client";

import { useEffect, useState } from "react";
import { Plus, Palette, Loader2 } from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import type { BrandKit } from "@/lib/types";

export default function BrandKitsPage() {
  const { currentOrg, isLoading: orgLoading } = useOrg();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!currentOrg) return;
    async function load() {
      try {
        const res = await fetch(`/api/brand-kits?org_id=${currentOrg!.id}`);
        if (res.ok) setKits(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [currentOrg]);

  const handleCreate = async () => {
    if (!currentOrg) return;
    setCreating(true);
    try {
      const res = await fetch("/api/brand-kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: currentOrg.id,
          name: "New Brand Kit",
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setKits((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Kits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage brand colors, fonts, and voice guidelines
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creating..." : "New Brand Kit"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="h-5 bg-muted rounded w-1/2 mb-3" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : kits.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Palette className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No brand kits yet
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Create a brand kit to define your brand identity
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Brand Kit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground truncate">
                  {kit.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    kit.status === "active"
                      ? "bg-green-500/10 text-green-400"
                      : kit.status === "archived"
                        ? "bg-muted text-muted-foreground"
                        : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {kit.status}
                </span>
              </div>

              {/* Color swatches */}
              {Object.keys(kit.colors).length > 0 && (
                <div className="flex gap-1 mb-3">
                  {Object.values(kit.colors)
                    .slice(0, 6)
                    .map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                </div>
              )}

              {kit.voice_guide && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {kit.voice_guide}
                </p>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                Updated{" "}
                {new Date(kit.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
