import { create } from "zustand";
import type {
  ResearchInput,
  ResearchSection,
  StrategyTile,
  QuadrantKey,
  GridState,
  MapData,
} from "./types";

interface AppState {
  // Step tracking
  currentStep: number;
  setCurrentStep: (step: number) => void;

  // Page 1: Research
  researchInput: ResearchInput;
  setResearchInput: (input: ResearchInput) => void;
  researchSections: ResearchSection[];
  setResearchSections: (sections: ResearchSection[]) => void;
  updateResearchSection: (id: string, content: string) => void;
  isResearching: boolean;
  setIsResearching: (v: boolean) => void;
  mapData: MapData | null;
  setMapData: (data: MapData | null) => void;

  // Page 2: Strategy Wells + Grid
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

export const useAppStore = create<AppState>((set, get) => ({
  currentStep: 1,
  setCurrentStep: (step) => set({ currentStep: step }),

  researchInput: {
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
  },
  setResearchInput: (input) => set({ researchInput: input }),

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
      currentStep: 1,
      researchInput: {
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
      },
      researchSections: [],
      isResearching: false,
      mapData: null,
      wells: { ...initialWells },
      grid: { ...initialGrid },
      isGeneratingStrategy: false,
      sessionId: null,
    }),
}));
