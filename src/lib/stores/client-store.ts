import { create } from "zustand";
import type { Client, BrandKit, Campaign } from "../types";

interface ClientState {
  client: Client | null;
  setClient: (c: Client | null) => void;

  clients: Client[];
  setClients: (c: Client[]) => void;

  brandKits: BrandKit[];
  setBrandKits: (b: BrandKit[]) => void;

  campaigns: Campaign[];
  setCampaigns: (c: Campaign[]) => void;

  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  resetClient: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: null,
  setClient: (client) => set({ client }),

  clients: [],
  setClients: (clients) => set({ clients }),

  brandKits: [],
  setBrandKits: (brandKits) => set({ brandKits }),

  campaigns: [],
  setCampaigns: (campaigns) => set({ campaigns }),

  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  resetClient: () =>
    set({
      client: null,
      brandKits: [],
      campaigns: [],
      isLoading: true,
    }),
}));
