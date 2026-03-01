export type EntityType = "candidate" | "pac" | "business";

export interface SocialMedia {
  twitter: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
}

export interface Opposition {
  id: string;
  name: string;
  website: string;
}

export interface ResearchInput {
  entityType: EntityType;
  name: string;
  location: string;
  goal: string;
  website: string;
  socialMedia: SocialMedia;
  oppositions: Opposition[];
}

export interface OppositionResearch {
  oppositionId: string;
  oppositionName: string;
  content: string;
  isEditing: boolean;
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

export interface MapData {
  lat: number;
  lng: number;
  zoom: number;
  boundaryQuery: string;
  label: string;
}

export interface SavedSession {
  id: string;
  createdAt: string;
  research: ResearchInput;
  researchSections: ResearchSection[];
  grid: GridState;
  wells: Record<QuadrantKey, StrategyTile[]>;
}

export interface MessagingFramework {
  id: string;
  user_id: string;
  title: string;
  current_step: number;

  // Step 1: Research Input
  entity_type: EntityType;
  name: string;
  location: string;
  goal: string;
  website: string;
  social_media: SocialMedia;

  // Step 1: Oppositions
  oppositions: Opposition[];

  // Step 2: Research Results
  research_sections: ResearchSection[];
  map_data: MapData | null;
  opposition_research: OppositionResearch[];

  // Step 3: Strategy
  wells: Record<QuadrantKey, StrategyTile[]>;
  grid: GridState;

  // Metadata
  status: "draft" | "in_progress" | "complete";
  created_at: string;
  updated_at: string;
}
