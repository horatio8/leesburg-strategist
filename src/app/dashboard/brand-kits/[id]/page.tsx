"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Plus,
  X,
  Check,
  Palette,
  Type,
  MessageSquare,
  Settings2,
} from "lucide-react";
import type { BrandKit } from "@/lib/types";

/* ───── color presets for quick add ───── */
const COLOR_PRESETS = [
  { label: "Primary", key: "primary" },
  { label: "Secondary", key: "secondary" },
  { label: "Accent", key: "accent" },
  { label: "Background", key: "background" },
  { label: "Text", key: "text" },
  { label: "Muted", key: "muted" },
];

const FONT_PRESETS = [
  { label: "Heading", key: "heading" },
  { label: "Body", key: "body" },
  { label: "Caption", key: "caption" },
];

export default function BrandKitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = params.id as string;

  const [kit, setKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ─── form state ─── */
  const [name, setName] = useState("");
  const [status, setStatus] = useState<BrandKit["status"]>("draft");
  const [voiceGuide, setVoiceGuide] = useState("");
  const [colors, setColors] = useState<{ key: string; value: string }[]>([]);
  const [fonts, setFonts] = useState<{ key: string; value: string }[]>([]);

  /* ─── new entry inputs ─── */
  const [newColorKey, setNewColorKey] = useState("");
  const [newColorValue, setNewColorValue] = useState("#3B82F6");
  const [newFontKey, setNewFontKey] = useState("");
  const [newFontValue, setNewFontValue] = useState("");

  /* ─── load ─── */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/brand-kits/${kitId}`);
        if (!res.ok) {
          router.push("/dashboard/brand-kits");
          return;
        }
        const data: BrandKit = await res.json();
        setKit(data);
        setName(data.name);
        setStatus(data.status);
        setVoiceGuide(data.voice_guide || "");
        setColors(
          Object.entries(data.colors).map(([key, value]) => ({ key, value }))
        );
        setFonts(
          Object.entries(data.fonts).map(([key, value]) => ({ key, value }))
        );
      } catch (err) {
        console.error(err);
        router.push("/dashboard/brand-kits");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [kitId, router]);

  /* ─── save ─── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const colorsObj: Record<string, string> = {};
      colors.forEach(({ key, value }) => {
        if (key.trim()) colorsObj[key.trim()] = value;
      });
      const fontsObj: Record<string, string> = {};
      fonts.forEach(({ key, value }) => {
        if (key.trim()) fontsObj[key.trim()] = value;
      });

      const res = await fetch(`/api/brand-kits/${kitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          status,
          voice_guide: voiceGuide || null,
          colors: colorsObj,
          fonts: fontsObj,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKit(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [kitId, name, status, voiceGuide, colors, fonts]);

  /* ─── delete ─── */
  const handleDelete = async () => {
    if (!confirm("Delete this brand kit? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/brand-kits/${kitId}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/brand-kits");
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  /* ─── color helpers ─── */
  const addColor = () => {
    if (!newColorKey.trim()) return;
    setColors((prev) => [...prev, { key: newColorKey.trim(), value: newColorValue }]);
    setNewColorKey("");
    setNewColorValue("#3B82F6");
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, field: "key" | "value", val: string) => {
    setColors((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  };

  /* ─── font helpers ─── */
  const addFont = () => {
    if (!newFontKey.trim() || !newFontValue.trim()) return;
    setFonts((prev) => [...prev, { key: newFontKey.trim(), value: newFontValue.trim() }]);
    setNewFontKey("");
    setNewFontValue("");
  };

  const removeFont = (index: number) => {
    setFonts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFont = (index: number, field: "key" | "value", val: string) => {
    setFonts((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: val } : f))
    );
  };

  /* ─── loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!kit) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <Link
        href="/dashboard/brand-kits"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Brand Kits
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Brand Kit</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Define your brand identity for AI-generated content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* ─── Name & Status ─── */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">General</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Brand Kit"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BrandKit["status"])}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Colors ─── */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Brand Colors</h2>
          </div>

          {colors.length > 0 && (
            <div className="space-y-2 mb-4">
              {colors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color.value}
                    onChange={(e) => updateColor(i, "value", e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={color.key}
                    onChange={(e) => updateColor(i, "key", e.target.value)}
                    placeholder="Color name"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <code className="text-xs text-muted-foreground font-mono px-2 py-1 bg-muted rounded min-w-[80px] text-center">
                    {color.value}
                  </code>
                  <button
                    onClick={() => removeColor(i)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add presets */}
          {COLOR_PRESETS.filter(
            (p) => !colors.some((c) => c.key === p.key)
          ).length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.filter(
                  (p) => !colors.some((c) => c.key === p.key)
                ).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() =>
                      setColors((prev) => [
                        ...prev,
                        { key: preset.key, value: "#3B82F6" },
                      ])
                    }
                    className="px-2.5 py-1 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom add */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="color"
              value={newColorValue}
              onChange={(e) => setNewColorValue(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={newColorKey}
              onChange={(e) => setNewColorKey(e.target.value)}
              placeholder="Custom color name..."
              onKeyDown={(e) => e.key === "Enter" && addColor()}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={addColor}
              disabled={!newColorKey.trim()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* ─── Fonts ─── */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Typography</h2>
          </div>

          {fonts.length > 0 && (
            <div className="space-y-2 mb-4">
              {fonts.map((font, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={font.key}
                    onChange={(e) => updateFont(i, "key", e.target.value)}
                    placeholder="Usage (e.g. heading)"
                    className="w-1/3 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    value={font.value}
                    onChange={(e) => updateFont(i, "value", e.target.value)}
                    placeholder="Font name (e.g. Inter, Playfair Display)"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={() => removeFont(i)}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick-add presets */}
          {FONT_PRESETS.filter(
            (p) => !fonts.some((f) => f.key === p.key)
          ).length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1.5">Quick add:</p>
              <div className="flex flex-wrap gap-1.5">
                {FONT_PRESETS.filter(
                  (p) => !fonts.some((f) => f.key === p.key)
                ).map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() =>
                      setFonts((prev) => [
                        ...prev,
                        { key: preset.key, value: "" },
                      ])
                    }
                    className="px-2.5 py-1 text-xs rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom add */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="text"
              value={newFontKey}
              onChange={(e) => setNewFontKey(e.target.value)}
              placeholder="Usage..."
              className="w-1/3 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              type="text"
              value={newFontValue}
              onChange={(e) => setNewFontValue(e.target.value)}
              placeholder="Font name..."
              onKeyDown={(e) => e.key === "Enter" && addFont()}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={addFont}
              disabled={!newFontKey.trim() || !newFontValue.trim()}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* ─── Voice Guide ─── */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">
              Voice & Tone Guide
            </h2>
          </div>
          <textarea
            value={voiceGuide}
            onChange={(e) => setVoiceGuide(e.target.value)}
            placeholder="Describe your brand's voice and tone. For example: 'Professional yet approachable. Use active voice. Avoid jargon. Our tone is warm, confident, and action-oriented...'"
            rows={6}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This guide helps the AI generate content that matches your brand voice.
          </p>
        </div>

        {/* ─── Preview ─── */}
        {colors.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Color Preview
            </h2>
            <div className="flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-16 h-16 rounded-xl border border-border shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5 capitalize">
                    {color.key}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {color.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Bottom Save ─── */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
