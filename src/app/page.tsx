"use client";

import { useAppStore } from "@/lib/store";
import StepNav from "@/components/StepNav";
import IntelEngine from "@/components/IntelEngine";
import StrategyWorkshop from "@/components/StrategyWorkshop";
import FinalPlaybook from "@/components/FinalPlaybook";

export default function Home() {
  const currentStep = useAppStore((s) => s.currentStep);

  return (
    <div className="min-h-screen flex flex-col">
      <StepNav />
      <main className="flex-1">
        {currentStep === 1 && <IntelEngine />}
        {currentStep === 2 && <StrategyWorkshop />}
        {currentStep === 3 && <FinalPlaybook />}
      </main>
    </div>
  );
}
