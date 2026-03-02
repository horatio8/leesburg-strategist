import { create } from "zustand";
import type { Organization, OrgRole, Profile } from "../types";

interface OrgState {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  userOrgs: Organization[];
  setUserOrgs: (orgs: Organization[]) => void;
  userRole: OrgRole | null;
  setUserRole: (role: OrgRole | null) => void;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  isSuperAdmin: boolean;
  setIsSuperAdmin: (v: boolean) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  resetOrg: () => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  currentOrg: null,
  setCurrentOrg: (org) => set({ currentOrg: org }),
  userOrgs: [],
  setUserOrgs: (orgs) => set({ userOrgs: orgs }),
  userRole: null,
  setUserRole: (role) => set({ userRole: role }),
  profile: null,
  setProfile: (profile) => set({ profile }),
  isSuperAdmin: false,
  setIsSuperAdmin: (v) => set({ isSuperAdmin: v }),
  isLoading: true,
  setIsLoading: (v) => set({ isLoading: v }),
  resetOrg: () =>
    set({
      currentOrg: null,
      userOrgs: [],
      userRole: null,
      profile: null,
      isSuperAdmin: false,
      isLoading: true,
    }),
}));
