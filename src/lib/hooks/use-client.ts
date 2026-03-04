"use client";

import { useEffect } from "react";
import { useClientStore } from "../stores/client-store";
import { useOrg } from "./use-org";
import type { Client, BrandKit, Campaign } from "../types";

export function useClient(clientId: string) {
  const { currentOrg } = useOrg();
  const {
    client,
    setClient,
    brandKits,
    setBrandKits,
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
        // Fetch client, brand kits, and campaigns in parallel
        const [clientRes, brandKitsRes, campaignsRes] = await Promise.all([
          fetch(`/api/clients/${clientId}`),
          fetch(`/api/brand-kits?org_id=${currentOrg.id}&client_id=${clientId}`),
          fetch(`/api/campaigns?org_id=${currentOrg.id}&client_id=${clientId}`),
        ]);

        if (cancelled) return;

        if (clientRes.ok) {
          const clientData: Client = await clientRes.json();
          setClient(clientData);
        }

        if (brandKitsRes.ok) {
          const bkData: BrandKit[] = await brandKitsRes.json();
          setBrandKits(bkData);
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
    brandKits,
    campaigns,
    isLoading,
  };
}
