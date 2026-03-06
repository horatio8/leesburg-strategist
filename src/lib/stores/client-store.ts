import { create } from "zustand";
import type { Client, Campaign } from "../types";

interface ClientState {
  client: Client | null;
  setClient: (c: Client | null) => void;

  clients: Client[];
  setClients: (c: Client[]) => void;

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

  campaigns: [],
  setCampaigns: (campaigns) => set({ campaigns }),

  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  resetClient: () =>
    set({
      client: null,
      campaigns: [],
      isLoading: true,
    }),
}));
