"use client";

import { useEffect, useState, use } from "react";
import { useAppStore } from "@/lib/store";
import StepNav from "@/components/StepNav";
import IntelEngine from "@/components/IntelEngine";
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
