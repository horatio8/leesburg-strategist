import { create } from "zustand";
import type {
  Campaign,
  CampaignResearch,
  CampaignStrategy,
  CreativeConcept,
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
      activeJobs: [],
      pendingApprovals: [],
    }),
}));
