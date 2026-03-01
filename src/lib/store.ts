import { create } from "zustand";
import type {
  ResearchInput,
  ResearchSection,
  StrategyTile,
  QuadrantKey,
  GridState,
  MapData,
  MessagingFramework,
  Opposition,
  OppositionResearch,
} from "./types";

interface AppState {
  // Framework context
  frameworkId: string | null;
  setFrameworkId: (id: string | null) => void;
  loadFramework: (data: MessagingFramework) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;

  // Step tracking
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Page 1: Campaign Input
  researchInput: ResearchInput;
  setResearchInput: (input: ResearchInput) => void;
  addOpposition: () => void;
  removeOpposition: (id: string) => void;
  updateOpposition: (id: string, field: keyof Opposition, value: string) => void;

  // Page 2: Research Results
  researchSections: ResearchSection[];
  setResearchSections: (sections: ResearchSection[]) => void;
  updateResearchSection: (id: string, content: string) => void;
  isResearching: boolean;
  setIsResearching: (v: boolean) => void;
  mapData: MapData | null;
  setMapData: (data: MapData | null) => void;
  oppositionResearch: OppositionResearch[];
  setOppositionResearch: (research: OppositionResearch[]) => void;
  updateOppositionResearch: (oppositionId: string, content: string) => void;
  isResearchingOpposition: boolean;
  setIsResearchingOpposition: (v: boolean) => void;

  // Page 3: Strategy Wells + Grid
  wells: Record<QuadrantKey, StrategyTile[]>;
  setWells: (wells: Record<QuadrantKey, StrategyTile[]>) => void;
  updateWellTile: (quadrant: QuadrantKey, tileId: string, text: string) => void;
  addCustomTile: (quadrant: QuadrantKey, text: string) => void;

  grid: GridState;
  moveTileToGrid: (tile: StrategyTile, targetQuadrant: QuadrantKey) => void;
  removeTileFromGrid: (tileId: string, quadrant: QuadrantKey) => void;

  isGeneratingStrategy: boolean;
  setIsGeneratingStrategy: (v: boolean) => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Reset
  resetAll: () => void;
}

const initialGrid: GridState = {
  "our-story": [],
  "the-attack": [],
  "their-defense": [],
  "the-counter": [],
};

const initialWells: Record<QuadrantKey, StrategyTile[]> = {
  "our-story": [],
  "the-attack": [],
  "their-defense": [],
  "the-counter": [],
};

const initialResearchInput: ResearchInput = {
  entityType: "candidate",
  name: "",
  location: "",
  goal: "",
  website: "",
  socialMedia: {
    twitter: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
    youtube: "",
  },
  oppositions: [],
};

export const useAppStore = create<AppState>((set) => ({
  // Framework context
  frameworkId: null,
  setFrameworkId: (id) => set({ frameworkId: id }),
  loadFramework: (data: MessagingFramework) =>
    set({
      frameworkId: data.id,
      currentStep: data.current_step || 1,
      researchInput: {
        entityType: data.entity_type || "candidate",
        name: data.name || "",
        location: data.location || "",
        goal: data.goal || "",
        website: data.website || "",
        socialMedia: data.social_media || initialResearchInput.socialMedia,
        oppositions: data.oppositions || [],
      },
      researchSections: data.research_sections || [],
      mapData: data.map_data || null,
      oppositionResearch: data.opposition_research || [],
      wells: data.wells && Object.keys(data.wells).length > 0
        ? data.wells
        : { ...initialWells },
      grid: data.grid && Object.keys(data.grid).length > 0
        ? data.grid
        : { ...initialGrid },
      saveStatus: "idle",
    }),
  saveStatus: "idle",
  setSaveStatus: (status) => set({ saveStatus: status }),

  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  researchInput: { ...initialResearchInput },
  setResearchInput: (input) => set({ researchInput: input }),
  addOpposition: () =>
    set((state) => ({
      researchInput: {
        ...state.researchInput,
        oppositions: [
          ...state.researchInput.oppositions,
          { id: `opp-${Date.now()}`, name: "", website: "" },
        ],
      },
    })),
  removeOpposition: (id) =>
    set((state) => ({
      researchInput: {
        ...state.researchInput,
        oppositions: state.researchInput.oppositions.filter((o) => o.id !== id),
      },
    })),
  updateOpposition: (id, field, value) =>
    set((state) => ({
      researchInput: {
        ...state.researchInput,
        oppositions: state.researchInput.oppositions.map((o) =>
          o.id === id ? { ...o, [field]: value } : o
        ),
      },
    })),

  researchSections: [],
  setResearchSections: (sections) => set({ researchSections: sections }),
  updateResearchSection: (id, content) =>
    set((state) => ({
      researchSections: state.researchSections.map((s) =>
        s.id === id ? { ...s, content } : s
      ),
    })),
  isResearching: false,
  setIsResearching: (v) => set({ isResearching: v }),
  mapData: null,
  setMapData: (data) => set({ mapData: data }),
  oppositionResearch: [],
  setOppositionResearch: (research) => set({ oppositionResearch: research }),
  updateOppositionResearch: (oppositionId, content) =>
    set((state) => ({
      oppositionResearch: state.oppositionResearch.map((r) =>
        r.oppositionId === oppositionId ? { ...r, content } : r
      ),
    })),
  isResearchingOpposition: false,
  setIsResearchingOpposition: (v) => set({ isResearchingOpposition: v }),

  wells: { ...initialWells },
  setWells: (wells) => set({ wells }),
  updateWellTile: (quadrant, tileId, text) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [quadrant]: state.wells[quadrant].map((t) =>
          t.id === tileId ? { ...t, text } : t
        ),
      },
    })),
  addCustomTile: (quadrant, text) =>
    set((state) => ({
      wells: {
        ...state.wells,
        [quadrant]: [
          ...state.wells[quadrant],
          {
            id: `custom-${Date.now()}`,
            text,
            quadrant,
            isCustom: true,
          },
        ],
      },
    })),

  grid: { ...initialGrid },
  moveTileToGrid: (tile, targetQuadrant) =>
    set((state) => {
      const currentGridTiles = state.grid[targetQuadrant];
      if (currentGridTiles.length >= 5) return state;
      if (currentGridTiles.some((t) => t.id === tile.id)) return state;

      // Remove from well
      const newWells = { ...state.wells };
      for (const key of Object.keys(newWells) as QuadrantKey[]) {
        newWells[key] = newWells[key].filter((t) => t.id !== tile.id);
      }

      // Remove from any other grid quadrant
      const newGrid = { ...state.grid };
      for (const key of Object.keys(newGrid) as QuadrantKey[]) {
        newGrid[key] = newGrid[key].filter((t) => t.id !== tile.id);
      }

      // Add to target quadrant
      newGrid[targetQuadrant] = [...newGrid[targetQuadrant], tile];

      return { wells: newWells, grid: newGrid };
    }),
  removeTileFromGrid: (tileId, quadrant) =>
    set((state) => {
      const tile = state.grid[quadrant].find((t) => t.id === tileId);
      if (!tile) return state;

      const newGrid = {
        ...state.grid,
        [quadrant]: state.grid[quadrant].filter((t) => t.id !== tileId),
      };

      // Return tile to its original well
      const wellKey = tile.quadrant;
      const newWells = {
        ...state.wells,
        [wellKey]: [...state.wells[wellKey], tile],
      };

      return { grid: newGrid, wells: newWells };
    }),

  isGeneratingStrategy: false,
  setIsGeneratingStrategy: (v) => set({ isGeneratingStrategy: v }),

  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  resetAll: () =>
    set({
      frameworkId: null,
      currentStep: 1,
      researchInput: { ...initialResearchInput },
      researchSections: [],
      isResearching: false,
      mapData: null,
      oppositionResearch: [],
      isResearchingOpposition: false,
      wells: { ...initialWells },
      grid: { ...initialGrid },
      isGeneratingStrategy: false,
      sessionId: null,
      saveStatus: "idle",
    }),
}));

// Auto-save subscription
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

useAppStore.subscribe((state, prevState) => {
  // Only auto-save when we have a frameworkId
  if (!state.frameworkId) return;

  // Check if saveable data changed
  const changed =
    state.currentStep !== prevState.currentStep ||
    state.researchInput !== prevState.researchInput ||
    state.researchSections !== prevState.researchSections ||
    state.mapData !== prevState.mapData ||
    state.oppositionResearch !== prevState.oppositionResearch ||
    state.wells !== prevState.wells ||
    state.grid !== prevState.grid;

  if (!changed) return;

  // Debounce: save after 2 seconds of inactivity
  if (saveTimeout) clearTimeout(saveTimeout);

  useAppStore.setState({ saveStatus: "saving" });

  saveTimeout = setTimeout(async () => {
    const current = useAppStore.getState();
    if (!current.frameworkId) return;

    try {
      const res = await fetch(`/api/frameworks/${current.frameworkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_step: current.currentStep,
          entity_type: current.researchInput.entityType,
          name: current.researchInput.name,
          location: current.researchInput.location,
          goal: current.researchInput.goal,
          website: current.researchInput.website,
          social_media: current.researchInput.socialMedia,
          oppositions: current.researchInput.oppositions,
          research_sections: current.researchSections,
          map_data: current.mapData,
          opposition_research: current.oppositionResearch,
          wells: current.wells,
          grid: current.grid,
        }),
      });

      if (res.ok) {
        useAppStore.setState({ saveStatus: "saved" });
        // Reset to idle after 2 seconds
        setTimeout(() => {
          useAppStore.setState({ saveStatus: "idle" });
        }, 2000);
      } else {
        useAppStore.setState({ saveStatus: "error" });
      }
    } catch {
      useAppStore.setState({ saveStatus: "error" });
    }
  }, 2000);
});
