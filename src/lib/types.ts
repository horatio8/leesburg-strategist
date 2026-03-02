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

// ============================================================
// Multi-tenancy & Campaign Types
// ============================================================

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
  // Joined data
  profile?: Profile;
}

export type CampaignStatus =
  | "draft"
  | "researching"
  | "ideation"
  | "creating"
  | "review"
  | "deployed"
  | "monitoring"
  | "paused"
  | "complete";

export type CampaignPriority = "high" | "normal" | "low";

export interface CampaignBrief {
  brand_name?: string;
  industry?: string;
  competitors?: string[];
  target_audience?: string;
  goals?: string;
  budget_range?: string;
  platforms?: string[];
  brand_voice_notes?: string;
  website?: string;
  social_urls?: Record<string, string>;
}

export interface Campaign {
  id: string;
  org_id: string;
  brand_kit_id: string | null;
  name: string;
  status: CampaignStatus;
  phase: number;
  priority: CampaignPriority;
  brief: CampaignBrief;
  budget_total: number;
  budget_spent: number;
  platforms: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandKit {
  id: string;
  org_id: string;
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  voice_guide: string | null;
  logo_urls: string[];
  canva_brand_kit_id: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export type ResearchType =
  | "competitor"
  | "social_audit"
  | "ad_library"
  | "seo"
  | "sentiment"
  | "brand_extraction";

export interface CampaignResearch {
  id: string;
  campaign_id: string;
  type: ResearchType;
  competitor_name: string | null;
  data: Record<string, unknown>;
  confidence: "high" | "medium" | "low";
  sources: Array<{ url?: string; label?: string }>;
  created_at: string;
}

export interface CampaignStrategy {
  id: string;
  campaign_id: string;
  grid_data: Record<string, unknown>;
  concepts: Array<Record<string, unknown>>;
  selected_concept_ids: string[];
  status: "draft" | "reviewing" | "approved";
  created_at: string;
  updated_at: string;
}

export interface CreativeConcept {
  id: string;
  campaign_id: string;
  strategy_id: string | null;
  name: string;
  visual_direction: string | null;
  headline_angles: string[];
  copy_tone: string | null;
  platform_strategy: Record<string, unknown>;
  rationale: string | null;
  status: "pending" | "approved" | "rejected" | "revision";
  created_at: string;
}

export interface Creative {
  id: string;
  campaign_id: string;
  concept_id: string | null;
  type: "copy" | "image" | "video";
  platform: "meta_feed" | "meta_stories" | "x" | "linkedin" | "multi" | null;
  content: Record<string, unknown>;
  asset_url: string | null;
  canva_design_id: string | null;
  canva_edit_url: string | null;
  status: "draft" | "reviewing" | "approved" | "deployed";
  created_at: string;
}

export type ApprovalType =
  | "concept"
  | "creative"
  | "strategy"
  | "deployment"
  | "optimization";

export interface Approval {
  id: string;
  campaign_id: string;
  org_id: string;
  type: ApprovalType;
  item_id: string;
  item_summary: string | null;
  agent_reasoning: string | null;
  status: "pending" | "approved" | "rejected" | "edited";
  reviewer_id: string | null;
  feedback: string | null;
  created_at: string;
  resolved_at: string | null;
  // Joined data
  campaign?: Campaign;
}

export interface DecisionLog {
  id: string;
  campaign_id: string;
  agent: string;
  decision_type: string;
  decision: string;
  reasoning: string | null;
  evidence: Record<string, unknown>;
  alternatives_considered: Array<Record<string, unknown>>;
  confidence: number;
  reversible: boolean;
  created_at: string;
}

export type JobStatus = "pending" | "running" | "completed" | "failed";

export interface Job {
  id: string;
  campaign_id: string | null;
  org_id: string;
  type: string;
  status: JobStatus;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  started_by: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}
