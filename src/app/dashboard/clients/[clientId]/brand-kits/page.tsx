"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Palette, Loader2, ChevronRight, Globe, Sparkles } from "lucide-react";
import { useClient } from "@/lib/hooks/use-client";
import { useOrg } from "@/lib/hooks/use-org";

export default function ClientBrandKitsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const { currentOrg } = useOrg();
  const { client, brandKits, isLoading } = useClient(clientId);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!currentOrg || !client) return;
    setCreating(true);
    try {
      const res = await fetch("/api/brand-kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_id: currentOrg.id,
          client_id: clientId,
          name: `${client.name} Brand Kit`,
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

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Brand Kits</h2>
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
          {creating ? "Creating..." : "New Brand Kit"}
        </button>
      </div>

      {brandKits.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Palette className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No brand kits yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Create a brand kit to define this client&apos;s brand identity
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {creating ? "Creating..." : "Create Brand Kit"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandKits.map((kit) => (
            <button
              key={kit.id}
              onClick={() => router.push(`/dashboard/brand-kits/${kit.id}`)}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground truncate">
                  {kit.name}
                </h3>
                <div className="flex items-center gap-2">
                  {kit.source && kit.source !== "manual" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                      {kit.source === "extracted" ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {kit.source === "extracted" ? "Extracted" : "Generated"}
                    </span>
                  )}
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
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
