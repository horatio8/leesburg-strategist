"use client";

import { useEffect } from "react";
import { useClientStore } from "../stores/client-store";
import { useOrg } from "./use-org";
import type { Client, Campaign } from "../types";

export function useClient(clientId: string) {
  const { currentOrg } = useOrg();
  const {
    client,
    setClient,
    campaigns,
    setCampaigns,
    isLoading,
    setIsLoading,
    resetClient,
  } = useClientStore();

  useEffect(() => {
    let cancelled = false;
    resetClient();

    async function load() {
      if (!clientId || !currentOrg) return;

      try {
        // Fetch client and campaigns in parallel (brand kits are now campaign-scoped)
        const [clientRes, campaignsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/campaigns?org_id=${currentOrg.id}&client_id=${clientId}`),
        ]);

        if (cancelled) return;

        if (clientRes.ok) {
          const clientData: Client = await clientRes.json();
          setClient(clientData);
        }

        if (campaignsRes.ok) {
          const campData: Campaign[] = await campaignsRes.json();
          setCampaigns(campData);
        }
      } catch (err) {
        console.error("Failed to load client data:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clientId, currentOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    client,
    campaigns,
    isLoading,
  };
}
