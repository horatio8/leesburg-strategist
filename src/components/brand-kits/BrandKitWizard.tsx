"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Check,
  ChevronRight,
  Palette,
  Type,
  MessageSquare,
  Image,
  Paintbrush,
  AlertCircle,
} from "lucide-react";
import type {
  BrandKitOption,
  PaletteOption,
  FontPairingOption,
  VoiceOption,
  StyleDirectionOption,
  LogoOption,
} from "@/lib/types";

interface BrandKitWizardProps {
  brandKitId: string;
  onFinalize: () => void;
}

type WizardStep = "palette" | "fonts" | "voice" | "style" | "logo" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ElementType }[] = [
  { key: "palette", label: "Colors", icon: Palette },
  { key: "fonts", label: "Typography", icon: Type },
  { key: "voice", label: "Voice", icon: MessageSquare },
  { key: "style", label: "Style", icon: Paintbrush },
  { key: "logo", label: "Logo", icon: Image },
  { key: "review", label: "Review", icon: Check },
];

export function BrandKitWizard({ brandKitId, onFinalize }: BrandKitWizardProps) {
  const [options, setOptions] = useState<BrandKitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<WizardStep>("palette");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load options
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/brand-kits/${brandKitId}/options`);
        if (res.ok) {
          const data: BrandKitOption[] = await res.json();
          setOptions(data);

          // Pre-select already-selected options
          const preselected: Record<string, string> = {};
          data.forEach((opt) => {
            if (opt.selected) preselected[opt.category] = opt.id;
          });
          setSelections(preselected);

          // Skip to first step that has options
          const categories = new Set(data.map((o) => o.category));
          const firstStep = STEPS.find(
            (s) => s.key !== "review" && categories.has(s.key as string)
          );
          if (firstStep) setCurrentStep(firstStep.key);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [brandKitId]);

  const getOptionsForStep = useCallback(
    (step: WizardStep): BrandKitOption[] => {
      if (step === "review") return [];
      const categoryMap: Record<string, string> = {
        palette: "palette",
        fonts: "font_pairing",
        voice: "voice",
        style: "style_direction",
        logo: "logo",
      };
      return options.filter((o) => o.category === categoryMap[step]);
    },
    [options]
  );

  const selectOption = async (category: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [category]: optionId }));

    // Persist selection to server
    try {
      await fetch(`/api/brand-kits/${brandKitId}/options/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option_ids: [optionId],
          category,
        }),
      });
    } catch (err) {
      console.error("Failed to persist selection:", err);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/brand-kits/${brandKitId}/options/finalize`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finalize");
      }
      onFinalize();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finalize");
    } finally {
      setFinalizing(false);
    }
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const availableSteps = STEPS.filter(
    (s) => s.key === "review" || getOptionsForStep(s.key).length > 0
  );

  const goNext = () => {
    const currentIdx = availableSteps.findIndex(
      (s) => s.key === currentStep
    );
    if (currentIdx < availableSteps.length - 1) {
      setCurrentStep(availableSteps[currentIdx + 1].key);
    }
  };

  const goPrev = () => {
    const currentIdx = availableSteps.findIndex(
      (s) => s.key === currentStep
    );
    if (currentIdx > 0) {
      setCurrentStep(availableSteps[currentIdx - 1].key);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {availableSteps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = step.key === currentStep;
          const isCompleted =
            step.key !== "review" &&
            selections[
              step.key === "fonts"
                ? "font_pairing"
                : step.key === "style"
                  ? "style_direction"
                  : step.key
            ];
          return (
            <div key={step.key} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-green-500/10 text-green-400"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <StepIcon className="w-3 h-3" />
                )}
                {step.label}
              </button>
              {i < availableSteps.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground/40 mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {currentStep === "review" ? (
        <ReviewStep
          options={options}
          selections={selections}
          onFinalize={handleFinalize}
          finalizing={finalizing}
          error={error}
        />
      ) : (
        <OptionSelector
          step={currentStep}
          options={getOptionsForStep(currentStep)}
          selectedId={
            selections[
              currentStep === "fonts"
                ? "font_pairing"
                : currentStep === "style"
                  ? "style_direction"
                  : currentStep
            ] || null
          }
          onSelect={(id) =>
            selectOption(
              currentStep === "fonts"
                ? "font_pairing"
                : currentStep === "style"
                  ? "style_direction"
                  : currentStep,
              id
            )
          }
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goPrev}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={goNext}
          disabled={currentStep === "review"}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-30"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Option Selector ─── */
function OptionSelector({
  step,
  options,
  selectedId,
  onSelect,
}: {
  step: WizardStep;
  options: BrandKitOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (options.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">
          No options available for this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          step={step}
          isSelected={selectedId === option.id}
          onSelect={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}

/* ─── Option Card ─── */
function OptionCard({
  option,
  step,
  isSelected,
  onSelect,
}: {
  option: BrandKitOption;
  step: WizardStep;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const data = option.data;

  return (
    <button
      onClick={onSelect}
      className={`bg-card rounded-xl border p-5 text-left transition-all cursor-pointer ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30 hover:shadow-md"
      }`}
    >
      {isSelected && (
        <div className="flex justify-end mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
            <Check className="w-3 h-3" /> Selected
          </span>
        </div>
      )}

      {step === "palette" && <PaletteCard data={data as PaletteOption} />}
      {step === "fonts" && <FontCard data={data as FontPairingOption} />}
      {step === "voice" && <VoiceCard data={data as VoiceOption} />}
      {step === "style" && (
        <StyleCard data={data as StyleDirectionOption} />
      )}
      {step === "logo" && <LogoCard data={data as LogoOption} />}
    </button>
  );
}

/* ─── Category-specific cards ─── */

function PaletteCard({ data }: { data: PaletteOption }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-1">{data.name}</h4>
      <p className="text-xs text-muted-foreground mb-3">{data.mood}</p>
      <div className="flex gap-1 mb-3">
        {Object.entries(data.colors || {}).map(([key, color]) => (
          <div key={key} className="text-center">
            <div
              className="w-10 h-10 rounded-lg border border-border"
              style={{ backgroundColor: color }}
            />
            <p className="text-[9px] text-muted-foreground mt-1 capitalize truncate w-10">
              {key}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {data.rationale}
      </p>
    </div>
  );
}

function FontCard({ data }: { data: FontPairingOption }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-2">{data.name}</h4>
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-14">Heading:</span>
          <span className="text-sm font-medium text-foreground">
            {data.heading}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-14">Body:</span>
          <span className="text-sm text-foreground">{data.body}</span>
        </div>
        {data.caption && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-14">Caption:</span>
            <span className="text-xs text-foreground">{data.caption}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {data.rationale}
      </p>
    </div>
  );
}

function VoiceCard({ data }: { data: VoiceOption }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-1">{data.tone}</h4>
      <p className="text-xs text-muted-foreground mb-3">{data.personality}</p>
      {data.sample_copy && (
        <blockquote className="text-xs text-foreground/80 italic border-l-2 border-primary/30 pl-3 mb-3 line-clamp-3">
          &ldquo;{data.sample_copy}&rdquo;
        </blockquote>
      )}
      {data.do_list?.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="text-green-400">Do:</span>{" "}
          {data.do_list.slice(0, 2).join(", ")}
          {data.do_list.length > 2 && "..."}
        </div>
      )}
    </div>
  );
}

function StyleCard({ data }: { data: StyleDirectionOption }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-2">{data.name}</h4>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
        {data.description}
      </p>
      {data.visual_elements?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.visual_elements.slice(0, 4).map((elem, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-full"
            >
              {elem}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function LogoCard({ data }: { data: LogoOption }) {
  return (
    <div>
      <h4 className="font-semibold text-foreground mb-1">{data.name}</h4>
      <p className="text-[10px] text-primary/70 mb-2 uppercase tracking-wide">
        {data.style}
      </p>
      {data.image_base64 && (
        <div className="mb-3 bg-white rounded-lg p-3 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${data.image_base64}`}
            alt={data.name}
            className="max-h-24 object-contain"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground line-clamp-3">
        {data.description}
      </p>
    </div>
  );
}

/* ─── Review Step ─── */
function ReviewStep({
  options,
  selections,
  onFinalize,
  finalizing,
  error,
}: {
  options: BrandKitOption[];
  selections: Record<string, string>;
  onFinalize: () => void;
  finalizing: boolean;
  error: string | null;
}) {
  const selectedOptions = options.filter((o) =>
    Object.values(selections).includes(o.id)
  );

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Review Your Selections
      </h3>

      {selectedOptions.length === 0 ? (
        <p className="text-sm text-muted-foreground mb-4">
          No options selected yet. Go back and select your preferred options.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {selectedOptions.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <Check className="w-4 h-4 text-green-400 shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {opt.category.replace("_", " ")}
                </span>
                <p className="text-sm text-foreground font-medium">
                  {(opt.data as { name?: string; tone?: string }).name ||
                    (opt.data as { tone?: string }).tone ||
                    "Selected"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={onFinalize}
        disabled={selectedOptions.length === 0 || finalizing}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors w-full"
      >
        {finalizing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        {finalizing ? "Applying..." : "Finalize Brand Kit"}
      </button>

      <p className="text-xs text-muted-foreground text-center mt-3">
        This will apply your selected options to the brand kit and you can
        fine-tune everything manually afterward.
      </p>
    </div>
  );
}
