"use client";

import { useState, useRef } from "react";
import { useAppStore } from "@/lib/store";
import type { QuadrantKey } from "@/lib/types";
import { QUADRANT_META } from "@/lib/constants";
import {
  FileDown,
  Link2,
  RotateCcw,
  ArrowLeft,
  Check,
  Copy,
  Shield,
  Swords,
  ShieldAlert,
  Undo2,
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const quadrantIcons: Record<QuadrantKey, React.ElementType> = {
  "our-story": Shield,
  "the-attack": Swords,
  "their-defense": ShieldAlert,
  "the-counter": Undo2,
};

const researchIcons: Record<string, React.ElementType> = {
  MapPin,
  BarChart3,
  UserSearch,
  TrendingUp,
  Newspaper,
};

export default function FinalPlaybook() {
  const {
    researchInput,
    researchSections,
    grid,
    setCurrentStep,
    resetAll,
  } = useAppStore();

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!gridRef.current) return;
    setIsExporting(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(
        (pageWidth - 20) / imgWidth,
        (pageHeight - 30) / imgHeight
      );

      const x = (pageWidth - imgWidth * ratio) / 2;

      // Title
      pdf.setFontSize(18);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      pdf.setTextColor(39, 37, 96);
      pdf.text(
        `Leesburg Grid: ${researchInput.name}`,
        pageWidth / 2,
        12,
        { align: "center" }
      );
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(
        `${researchInput.location} | ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        18,
        { align: "center" }
      );

      pdf.addImage(imgData, "PNG", x, 22, imgWidth * ratio, imgHeight * ratio);

      pdf.save(
        `leesburg-grid-${researchInput.name.toLowerCase().replace(/\s+/g, "-")}.pdf`
      );
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          researchInput,
          researchSections,
          grid,
        }),
      });

      if (!res.ok) throw new Error("Share failed");

      const data = await res.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    resetAll();
  };

  const totalInGrid = Object.values(grid).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">The Final Playbook</h1>
          <p className="text-muted-foreground">
            {researchInput.name} &bull; {researchInput.location} &bull;{" "}
            {totalInGrid} strategies selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Edit Grid
          </button>
        </div>
      </div>

      {/* Leesburg Grid Display */}
      <div ref={gridRef} className="mb-8 p-6 bg-card rounded-xl border border-border">
        <h2 className="text-xl font-bold text-center mb-6">
          Leesburg Grid: {researchInput.name}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {(
            [
              "our-story",
              "their-defense",
              "the-attack",
              "the-counter",
            ] as QuadrantKey[]
          ).map((key) => {
            const meta = QUADRANT_META[key];
            const Icon = quadrantIcons[key];
            const tiles = grid[key];

            return (
              <div
                key={key}
                className={`rounded-xl border-2 ${meta.borderColor} p-5`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                  <div>
                    <h3 className={`font-bold ${meta.color}`}>{meta.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {tiles.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No strategies selected
                    </p>
                  ) : (
                    tiles.map((tile, i) => (
                      <div
                        key={tile.id}
                        className={`flex items-start gap-3 p-3 rounded-lg ${meta.bgColor}`}
                      >
                        <span
                          className={`text-xs font-bold ${meta.color} mt-0.5 shrink-0`}
                        >
                          {i + 1}.
                        </span>
                        <p className={`text-sm leading-relaxed ${meta.color}`}>
                          {tile.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research Context (Collapsible) */}
      <div className="mb-8">
        <button
          onClick={() => setShowResearch(!showResearch)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showResearch ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Research Context ({researchSections.length} sections)
        </button>

        {showResearch && (
          <div className="mt-4 space-y-3">
            {researchSections.map((section) => {
              const Icon = researchIcons[section.icon] || MapPin;
              return (
                <div
                  key={section.id}
                  className="bg-card rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <h4 className="font-medium text-sm">{section.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export to PDF"}
        </button>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-lg font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <Link2 className="w-4 h-4" />
          {isSharing ? "Creating Link..." : "Share Link"}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-muted-foreground rounded-lg font-medium hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* Share URL Display */}
      {shareUrl && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
          <Link2 className="w-4 h-4 text-primary shrink-0" />
          <code className="text-sm text-foreground flex-1 truncate">
            {shareUrl}
          </code>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
