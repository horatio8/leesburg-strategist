"use client";

import { useEffect, useCallback } from "react";
import { useCampaignStore } from "../stores/campaign-store";
import type { Campaign } from "../types";

export function useCampaign(campaignId?: string) {
  const {
    campaign,
    setCampaign,
    research,
    setResearch,
    strategy,
    setStrategy,
    concepts,
    setConcepts,
    activeJobs,
    setActiveJobs,
    pendingApprovals,
    setPendingApprovals,
    resetCampaign,
  } = useCampaignStore();

  const loadCampaign = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/campaigns/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCampaign(data);
      }
    },
    [setCampaign]
  );

  useEffect(() => {
    if (!campaignId) return;

    let cancelled = false;

    async function load() {
      // Load campaign details
      const campaignRes = await fetch(`/api/campaigns/${campaignId}`);
      if (!campaignRes.ok || cancelled) return;
      const campaignData = await campaignRes.json();
      setCampaign(campaignData);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [campaignId, setCampaign]);

  const updateStatus = useCallback(
    async (status: Campaign["status"]) => {
      if (!campaign) return;
      const res = await fetch(`/api/campaigns/${campaign.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaign(updated);
      }
    },
    [campaign, setCampaign]
  );

  return {
    campaign,
    setCampaign,
    research,
    setResearch,
    strategy,
    setStrategy,
    concepts,
    setConcepts,
    activeJobs,
    setActiveJobs,
    pendingApprovals,
    setPendingApprovals,
    resetCampaign,
    loadCampaign,
    updateStatus,
  };
}
