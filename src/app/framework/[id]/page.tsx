"use client";

import { useEffect, useState, use } from "react";
import { useAppStore } from "@/lib/store";
import StepNav from "@/components/StepNav";
import IntelEngine from "@/components/IntelEngine";
import PreliminaryResearch from "@/components/PreliminaryResearch";
import StrategyWorkshop from "@/components/StrategyWorkshop";
import FinalPlaybook from "@/components/FinalPlaybook";
import { useRouter } from "next/navigation";

export default function FrameworkEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentStep = useAppStore((s) => s.currentStep);
  const loadFramework = useAppStore((s) => s.loadFramework);
  const setFrameworkId = useAppStore((s) => s.setFrameworkId);
  const campaignId = useAppStore((s) => s.campaignId);
  const researchInput = useAppStore((s) => s.researchInput);
  const setIsResearching = useAppStore((s) => s.setIsResearching);
  const setResearchSections = useAppStore((s) => s.setResearchSections);
  const setMapData = useAppStore((s) => s.setMapData);
  const setCurrentStep = useAppStore((s) => s.setCurrentStep);
  const [autoResearchTriggered, setAutoResearchTriggered] = useState(false);

  useEffect(() => {
    const fetchFramework = async () => {
      try {
        const res = await fetch(`/api/frameworks/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Framework not found");
            return;
          }
          throw new Error("Failed to load framework");
        }
        const data = await res.json();
        loadFramework(data);
        setFrameworkId(id);
      } catch (err) {
        console.error("Failed to load framework:", err);
        setError("Failed to load framework");
      } finally {
        setLoading(false);
      }
    };

    fetchFramework();

    // Cleanup: clear framework context on unmount
    return () => {
      setFrameworkId(null);
    };
  }, [id, loadFramework, setFrameworkId]);

  // Auto-launch research when framework was pre-filled from a campaign
  useEffect(() => {
    if (
      !loading &&
      !autoResearchTriggered &&
      campaignId &&
      currentStep === 1 &&
      researchInput.name &&
      researchInput.goal
    ) {
      setAutoResearchTriggered(true);
      (async () => {
        setIsResearching(true);
        try {
          const res = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(researchInput),
          });
          if (res.ok) {
            const data = await res.json();
            setResearchSections(data.sections);
            if (data.mapData) setMapData(data.mapData);
            setCurrentStep(2);
          }
        } catch (err) {
          console.error("Auto-research failed:", err);
          // Fall back to showing step 1 so user can manually launch
        } finally {
          setIsResearching(false);
        }
      })();
    }
  }, [loading, autoResearchTriggered, campaignId, currentStep, researchInput, setIsResearching, setResearchSections, setMapData, setCurrentStep]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <StepNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Loading framework...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <StepNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-primary hover:underline text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // When framework is linked to a campaign and still on step 1,
  // show a research-in-progress state instead of the IntelEngine form
  const showAutoResearchLoading = campaignId && currentStep === 1;

  return (
    <div className="min-h-screen flex flex-col">
      <StepNav />
      <main className="flex-1">
        {currentStep === 1 && !showAutoResearchLoading && <IntelEngine />}
        {showAutoResearchLoading && (
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Launching Research</h1>
              <p className="text-muted-foreground">
                Pre-filled from campaign details. Running preliminary research...
              </p>
            </div>
            <div className="space-y-4">
              {["Geographic Profile", "Electoral Data", "Incumbent Audit", "Issue Pulse", "Strategic Context"].map(
                (title, i) => (
                  <div
                    key={title}
                    className="bg-card rounded-xl border border-border p-6"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-muted research-pulse" />
                      <div className="h-5 w-40 bg-muted rounded research-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-muted/50 rounded research-pulse" />
                      <div className="h-4 w-3/4 bg-muted/50 rounded research-pulse" />
                      <div className="h-4 w-5/6 bg-muted/50 rounded research-pulse" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        {currentStep === 2 && <PreliminaryResearch />}
        {currentStep === 3 && <StrategyWorkshop />}
        {currentStep === 4 && <FinalPlaybook />}
      </main>
    </div>
  );
}
