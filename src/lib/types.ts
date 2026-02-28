export type EntityType = "candidate" | "pac" | "business";

export interface ResearchInput {
  entityType: EntityType;
  name: string;
  location: string;
  goal: string;
}

export interface ResearchSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  isEditing: boolean;
}

export interface StrategyTile {
  id: string;
  text: string;
  quadrant: QuadrantKey;
  isCustom?: boolean;
}

export type QuadrantKey =
  | "our-story"
  | "the-attack"
  | "their-defense"
  | "the-counter";

export interface Quadrant {
  key: QuadrantKey;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tiles: StrategyTile[];
}

export interface GridState {
  "our-story": StrategyTile[];
  "the-attack": StrategyTile[];
  "their-defense": StrategyTile[];
  "the-counter": StrategyTile[];
}

export interface SavedSession {
  id: string;
  createdAt: string;
  research: ResearchInput;
  researchSections: ResearchSection[];
  grid: GridState;
  wells: Record<QuadrantKey, StrategyTile[]>;
}
