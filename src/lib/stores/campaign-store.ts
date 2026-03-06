import { create } from "zustand";
import type {
  Campaign,
  CampaignResearch,
  CampaignStrategy,
  CreativeConcept,
  BrandKit,
  MessagingFramework,
  EmailCampaign,
  Job,
  Approval,
} from "../types";

interface CampaignState {
  campaign: Campaign | null;
  setCampaign: (c: Campaign | null) => void;

  research: CampaignResearch[];
  setResearch: (r: CampaignResearch[]) => void;

  strategy: CampaignStrategy | null;
  setStrategy: (s: CampaignStrategy | null) => void;

  concepts: CreativeConcept[];
  setConcepts: (c: CreativeConcept[]) => void;

  brandKits: BrandKit[];
  setBrandKits: (b: BrandKit[]) => void;

  frameworks: MessagingFramework[];
  setFrameworks: (f: MessagingFramework[]) => void;

  emailCampaigns: EmailCampaign[];
  setEmailCampaigns: (e: EmailCampaign[]) => void;

  activeJobs: Job[];
  setActiveJobs: (j: Job[]) => void;
  updateJob: (job: Job) => void;

  pendingApprovals: Approval[];
  setPendingApprovals: (a: Approval[]) => void;

  resetCampaign: () => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaign: null,
  setCampaign: (campaign) => set({ campaign }),

  research: [],
  setResearch: (research) => set({ research }),

  strategy: null,
  setStrategy: (strategy) => set({ strategy }),

  concepts: [],
  setConcepts: (concepts) => set({ concepts }),

  brandKits: [],
  setBrandKits: (brandKits) => set({ brandKits }),

  frameworks: [],
  setFrameworks: (frameworks) => set({ frameworks }),

  emailCampaigns: [],
  setEmailCampaigns: (emailCampaigns) => set({ emailCampaigns }),

  activeJobs: [],
  setActiveJobs: (activeJobs) => set({ activeJobs }),
  updateJob: (job) =>
    set((state) => ({
      activeJobs: state.activeJobs.map((j) => (j.id === job.id ? job : j)),
    })),

  pendingApprovals: [],
  setPendingApprovals: (pendingApprovals) => set({ pendingApprovals }),

  resetCampaign: () =>
    set({
      campaign: null,
      research: [],
      strategy: null,
      concepts: [],
      brandKits: [],
      frameworks: [],
      emailCampaigns: [],
      activeJobs: [],
      pendingApprovals: [],
    }),
}));
