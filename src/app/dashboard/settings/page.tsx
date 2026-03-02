"use client";

import { useState } from "react";
import { Settings, Save, Loader2 } from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";

export default function SettingsPage() {
  const { currentOrg, isLoading } = useOrg();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");

  // Initialize form values when org loads
  useState(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setIndustry(currentOrg.industry || "");
      setWebsite(currentOrg.website || "");
    }
  });

  const handleSave = async () => {
    if (!currentOrg) return;
    setSaving(true);
    try {
      await fetch(`/api/orgs/${currentOrg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry, website }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !currentOrg) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          Organization Settings
        </h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Organization Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Industry
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. SaaS, E-commerce, Political"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className={inputClass}
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-foreground mb-2">
          Organization Details
        </h2>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            Slug: <span className="font-mono">{currentOrg.slug}</span>
          </p>
          <p>
            Created:{" "}
            {new Date(currentOrg.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
