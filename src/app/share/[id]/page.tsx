"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { QuadrantKey, GridState, ResearchInput } from "@/lib/types";
import { QUADRANT_META } from "@/lib/constants";
import { Shield, Swords, ShieldAlert, Undo2, Loader2 } from "lucide-react";
import Image from "next/image";

const quadrantIcons: Record<QuadrantKey, React.ElementType> = {
  "our-story": Shield,
  "the-attack": Swords,
  "their-defense": ShieldAlert,
  "the-counter": Undo2,
};

interface SharedData {
  researchInput: ResearchInput;
  grid: GridState;
  createdAt: string;
}

export default function SharedPlaybook() {
  const params = useParams();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/share?id=${params.id}`);
        if (!res.ok) throw new Error("Session not found");
        const result = await res.json();
        setData(result);
      } catch {
        setError("This shared session could not be found or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session Not Found</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const totalInGrid = Object.values(data.grid).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Campaign Institute"
            width={180}
            height={54}
            className="h-9 w-auto"
          />
          <span className="text-xs text-muted-foreground ml-2">Read-only</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Leesburg Grid: {data.researchInput.name}
          </h1>
          <p className="text-muted-foreground">
            {data.researchInput.location} &bull; {totalInGrid} strategies &bull;
            Shared {new Date(data.createdAt).toLocaleDateString()}
          </p>
        </div>

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
            const tiles = data.grid[key];

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
                          className={`text-xs font-bold ${meta.color} mt-0.5`}
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
    </div>
  );
}
