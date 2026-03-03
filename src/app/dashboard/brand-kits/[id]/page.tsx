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
  Globe,
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import type { BrandKit, BrandKitOption } from "@/lib/types";
import { useOrg } from "@/lib/hooks/use-org";
import { ExtractionForm } from "@/components/brand-kits/ExtractionForm";
import { GenerationForm } from "@/components/brand-kits/GenerationForm";
import { BrandKitWizard } from "@/components/brand-kits/BrandKitWizard";

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

type PageMode = "loading" | "setup" | "selecting" | "editing";
type SetupPath = "extract" | "generate" | null;

function determineMode(
  kit: BrandKit | null,
  options: BrandKitOption[],
  forceSetup: boolean
): PageMode {
  if (!kit) return "loading";

  // Allow user to return to setup mode
  if (forceSetup) return "setup";

  // If there are unfinalized options, show the wizard
  if (options.length > 0) return "selecting";

  // If the kit has actual content (colors/fonts/voice), show editor
  const hasColors = Object.keys(kit.colors || {}).length > 0;
  const hasFonts = Object.keys(kit.fonts || {}).length > 0;
  const hasVoice = !!kit.voice_guide;
  if (hasColors || hasFonts || hasVoice) return "editing";

  // Otherwise show setup (choose path)
  return "setup";
}

export default function BrandKitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = params.id as string;
  const { currentOrg } = useOrg();

  const [kit, setKit] = useState<BrandKit | null>(null);
  const [options, setOptions] = useState<BrandKitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setupPath, setSetupPath] = useState<SetupPath>(null);
  const [forceSetup, setForceSetup] = useState(false);

  /* ─── form state ─── */
  const [name, setName] = useState("");
  const [status, setStatus] = useState<BrandKit["status"]>("draft");
  const [voiceGuide, setVoiceGuide] = useState("");
  const [colors, setColors] = useState<{ key: string; value: string }[]>([]);
  const [fonts, setFonts] = useState<{ key: string; value: string }[]>([]);

  const [logos, setLogos] = useState<string[]>([]);

  /* ─── new entry inputs ─── */
  const [newColorKey, setNewColorKey] = useState("");
  const [newColorValue, setNewColorValue] = useState("#3B82F6");
  const [newFontKey, setNewFontKey] = useState("");
  const [newFontValue, setNewFontValue] = useState("");

  /* ─── load kit + options ─── */
  const loadKit = useCallback(async () => {
    try {
      const [kitRes, optionsRes] = await Promise.all([
        fetch(`/api/brand-kits/${kitId}`),
        fetch(`/api/brand-kits/${kitId}/options`),
      ]);

      if (!kitRes.ok) {
        router.push("/dashboard/brand-kits");
        return;
      }

      const kitData: BrandKit = await kitRes.json();
      const optionsData: BrandKitOption[] = optionsRes.ok
        ? await optionsRes.json()
        : [];

      setKit(kitData);
      setOptions(optionsData);
      setName(kitData.name);
      setStatus(kitData.status);
      setVoiceGuide(kitData.voice_guide || "");
      setColors(
        Object.entries(kitData.colors || {}).map(([key, value]) => ({
          key,
          value,
        }))
      );
      setFonts(
        Object.entries(kitData.fonts || {}).map(([key, value]) => ({
          key,
          value,
        }))
      );
      setLogos(kitData.logo_urls || []);
    } catch (err) {
      console.error(err);
      router.push("/dashboard/brand-kits");
    } finally {
      setLoading(false);
    }
  }, [kitId, router]);

  useEffect(() => {
    loadKit();
  }, [loadKit]);

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
          logo_urls: logos,
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
  }, [kitId, name, status, voiceGuide, colors, fonts, logos]);

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

  /* ─── reset (clear options and return to setup) ─── */
  const handleReset = async () => {
    if (
      !confirm(
        "Reset this brand kit? Generated/extracted options will be removed."
      )
    )
      return;
    try {
      await fetch(`/api/brand-kits/${kitId}/options`, { method: "DELETE" });
      setOptions([]);
      setSetupPath(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── color helpers ─── */
  const addColor = () => {
    if (!newColorKey.trim()) return;
    setColors((prev) => [
      ...prev,
      { key: newColorKey.trim(), value: newColorValue },
    ]);
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
    setFonts((prev) => [
      ...prev,
      { key: newFontKey.trim(), value: newFontValue.trim() },
    ]);
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

  /* ─── logo helpers ─── */
  const removeLogo = (index: number) => {
    setLogos((prev) => prev.filter((_, i) => i !== index));
  };

  /* ─── callbacks for child components ─── */
  const handleExtractionComplete = () => {
    setSetupPath(null);
    setForceSetup(false);
    loadKit();
  };

  const handleGenerationComplete = () => {
    setSetupPath(null);
    setForceSetup(false);
    loadKit();
  };

  const handleWizardFinalize = () => {
    setOptions([]);
    loadKit();
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

  const mode = determineMode(kit, options, forceSetup);
  const orgId = currentOrg?.id || kit.org_id;

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

      {/* ═══════════════════════════════════════════ */}
      {/* SETUP MODE — choose path or show form       */}
      {/* ═══════════════════════════════════════════ */}
      {mode === "setup" && !setupPath && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Set Up Brand Kit
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Choose how to populate your brand identity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Extract from Website */}
            <button
              onClick={() => setSetupPath("extract")}
              className="bg-card rounded-xl border border-border p-6 text-left hover:border-blue-500/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Extract from Website
              </h3>
              <p className="text-sm text-muted-foreground">
                Analyze an existing website to pull colors, fonts, voice, and
                visual style automatically.
              </p>
            </button>

            {/* Generate New Brand */}
            <button
              onClick={() => setSetupPath("generate")}
              className="bg-card rounded-xl border border-border p-6 text-left hover:border-purple-500/50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Generate New Brand
              </h3>
              <p className="text-sm text-muted-foreground">
                AI creates color palettes, font pairings, logo concepts, and a
                voice guide from scratch.
              </p>
            </button>
          </div>

          <div className="text-center">
            {forceSetup ? (
              <button
                onClick={() => setForceSetup(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                &larr; Back to Editor
              </button>
            ) : (
              <button
                onClick={() => {
                  /* skip to manual editing — set a color to trigger editing mode */
                  setColors([{ key: "primary", value: "#3B82F6" }]);
                  /* force a quick save so mode becomes editing */
                  handleSave();
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip and build manually &rarr;
              </button>
            )}
          </div>
        </>
      )}

      {/* Setup mode with extraction form */}
      {mode === "setup" && setupPath === "extract" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Extract Brand
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Pull your brand identity from an existing website
              </p>
            </div>
            <button
              onClick={() => setSetupPath(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Choose different method
            </button>
          </div>
          <ExtractionForm
            brandKitId={kitId}
            orgId={orgId}
            onComplete={handleExtractionComplete}
          />
        </>
      )}

      {/* Setup mode with generation form */}
      {mode === "setup" && setupPath === "generate" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Generate Brand
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI-powered brand identity creation
              </p>
            </div>
            <button
              onClick={() => setSetupPath(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Choose different method
            </button>
          </div>
          <GenerationForm
            brandKitId={kitId}
            orgId={orgId}
            onComplete={handleGenerationComplete}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* SELECTING MODE — wizard for picking options  */}
      {/* ═══════════════════════════════════════════ */}
      {mode === "selecting" && (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Select Brand Options
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Choose your preferred options for each category
              </p>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Start Over
            </button>
          </div>
          <BrandKitWizard
            brandKitId={kitId}
            onFinalize={handleWizardFinalize}
          />
        </>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* EDITING MODE — visual brand editor           */}
      {/* ═══════════════════════════════════════════ */}
      {mode === "editing" && (
        <>
          {/* ─── Header: inline-editable name + controls ─── */}
          <div className="mb-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Brand Kit Name"
              className="text-2xl font-bold text-foreground bg-transparent w-full outline-none placeholder:text-muted-foreground/50 border-b border-transparent hover:border-border focus:border-primary/30 pb-1 transition-colors"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2.5">
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as BrandKit["status"])
                  }
                  className="px-2.5 py-1 bg-muted border-none rounded-full text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer appearance-none"
                >
                  <option value="draft">⏳ Draft</option>
                  <option value="active">✓ Active</option>
                  <option value="archived">📦 Archived</option>
                </select>
                {kit.source && kit.source !== "manual" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                    {kit.source === "extracted" ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {kit.source === "extracted" ? "Extracted" : "AI Generated"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setForceSetup(true);
                    setSetupPath(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg text-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Tools
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-400 hover:bg-red-500/10 rounded-lg text-xs transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* ═══ COLORS ═══ */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Brand Colors
                  </h2>
                </div>
                <button
                  onClick={() =>
                    setColors((prev) => [
                      ...prev,
                      {
                        key: `color-${prev.length + 1}`,
                        value: "#6366F1",
                      },
                    ])
                  }
                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {/* Color strip preview */}
              {colors.length > 0 && (
                <div className="flex rounded-xl overflow-hidden h-14 border border-border mb-4">
                  {colors.map((color, i) => (
                    <div
                      key={i}
                      className="flex-1 transition-colors"
                      style={{ backgroundColor: color.value }}
                      title={`${color.key}: ${color.value}`}
                    />
                  ))}
                </div>
              )}

              {/* Color cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className="group bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {/* Color swatch — click to change */}
                    <label className="block relative cursor-pointer">
                      <div
                        className="w-full h-20 transition-colors"
                        style={{ backgroundColor: color.value }}
                      />
                      <input
                        type="color"
                        value={color.value}
                        onChange={(e) =>
                          updateColor(i, "value", e.target.value)
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                    {/* Name + hex below */}
                    <div className="p-3">
                      <input
                        type="text"
                        value={color.key}
                        onChange={(e) =>
                          updateColor(i, "key", e.target.value)
                        }
                        className="w-full text-sm font-medium text-foreground bg-transparent outline-none capitalize border-b border-transparent focus:border-primary/30 pb-0.5 transition-colors"
                        placeholder="Color name"
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <code className="text-[11px] text-muted-foreground font-mono">
                          {color.value}
                        </code>
                        <button
                          onClick={() => removeColor(i)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-red-400 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick-add presets as mini buttons */}
                {colors.length === 0 && (
                  <div className="col-span-full flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() =>
                          setColors((prev) => [
                            ...prev,
                            { key: preset.key, value: "#3B82F6" },
                          ])
                        }
                        className="px-3 py-1.5 text-xs rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ═══ TYPOGRAPHY ═══ */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Typography
                  </h2>
                </div>
                {FONT_PRESETS.filter(
                  (p) => !fonts.some((f) => f.key === p.key)
                ).length > 0 && (
                  <div className="flex items-center gap-1.5">
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
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {fonts.map((font, i) => (
                  <div
                    key={i}
                    className="group bg-card rounded-xl border border-border p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider capitalize">
                        {font.key}
                      </span>
                      <button
                        onClick={() => removeFont(i)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Type specimen preview */}
                    <p
                      className={`text-foreground mb-3 ${
                        font.key === "heading"
                          ? "text-2xl font-bold"
                          : font.key === "caption"
                            ? "text-xs text-muted-foreground"
                            : "text-base"
                      }`}
                    >
                      {font.value || (
                        <span className="text-muted-foreground/40 italic">
                          Set a font...
                        </span>
                      )}
                    </p>
                    {/* Editable font name */}
                    <input
                      type="text"
                      value={font.value}
                      onChange={(e) =>
                        updateFont(i, "value", e.target.value)
                      }
                      placeholder="Font name (e.g. Inter, Playfair Display)"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                ))}

                {fonts.length === 0 && (
                  <div className="bg-card/50 rounded-xl border border-dashed border-border p-8 text-center">
                    <Type className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      No fonts defined yet
                    </p>
                    <div className="flex justify-center gap-2">
                      {FONT_PRESETS.map((preset) => (
                        <button
                          key={preset.key}
                          onClick={() =>
                            setFonts((prev) => [
                              ...prev,
                              { key: preset.key, value: "" },
                            ])
                          }
                          className="px-3 py-1.5 text-xs rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ═══ VOICE & TONE ═══ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Voice & Tone
                </h2>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                {voiceGuide ? (
                  <div className="space-y-3">
                    {/* Parse voice guide into formatted sections */}
                    {voiceGuide.split("\n\n").map((section, i) => {
                      const colonIdx = section.indexOf(":");
                      if (colonIdx > 0 && colonIdx < 20) {
                        const label = section.slice(0, colonIdx).trim();
                        const content = section.slice(colonIdx + 1).trim();
                        return (
                          <div key={i}>
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                              {label}
                            </p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {content}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <p
                          key={i}
                          className="text-sm text-foreground leading-relaxed"
                        >
                          {section}
                        </p>
                      );
                    })}
                    {/* Edit area — collapsed by default, expand to edit */}
                    <details className="pt-3 border-t border-border">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                        Edit raw text
                      </summary>
                      <textarea
                        value={voiceGuide}
                        onChange={(e) => setVoiceGuide(e.target.value)}
                        rows={8}
                        className="w-full mt-3 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                      />
                    </details>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={voiceGuide}
                      onChange={(e) => setVoiceGuide(e.target.value)}
                      placeholder="Describe your brand's voice and tone. For example:&#10;&#10;Tone: Professional yet approachable&#10;&#10;Personality: Warm, confident, action-oriented&#10;&#10;Do: Use active voice, be concise&#10;&#10;Don't: Use jargon, be overly formal"
                      rows={6}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This guide helps the AI generate content that matches
                      your brand voice.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ═══ LOGOS ═══ */}
            {logos.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Logos
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {logos.map((logo, i) => (
                    <div
                      key={i}
                      className="group relative bg-white rounded-xl border border-border p-4 flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logo}
                        alt={`Logo ${i + 1}`}
                        className="max-h-24 object-contain"
                      />
                      <button
                        onClick={() => removeLogo(i)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Save Bar ─── */}
            <div className="sticky bottom-4 z-10">
              <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-lg p-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {saved
                    ? "✓ All changes saved"
                    : "Changes are unsaved"}
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
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

            {/* Bottom spacing */}
            <div className="h-4" />
          </div>
        </>
      )}
    </div>
  );
}
