"use client";

import { useAppStore } from "@/lib/store";
import { Search, Grid3X3, FileText } from "lucide-react";

const steps = [
  { num: 1, label: "Intel Engine", icon: Search },
  { num: 2, label: "Strategy Workshop", icon: Grid3X3 },
  { num: 3, label: "Final Playbook", icon: FileText },
];

export default function StepNav() {
  const { currentStep, setCurrentStep, researchSections, grid } =
    useAppStore();

  const canNavigateTo = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return researchSections.length > 0;
    if (step === 3) {
      const totalInGrid = Object.values(grid).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      return totalInGrid > 0;
    }
    return false;
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Grid3X3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Campaign Institute
            </span>
          </div>

          <div className="flex items-center gap-1">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isAccessible = canNavigateTo(step.num);

              return (
                <div key={step.num} className="flex items-center">
                  {i > 0 && (
                    <div
                      className={`w-8 h-px mx-1 ${
                        currentStep > i ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                  <button
                    onClick={() => isAccessible && setCurrentStep(step.num)}
                    disabled={!isAccessible}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : isAccessible
                          ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          : "text-muted-foreground/40 cursor-not-allowed"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
