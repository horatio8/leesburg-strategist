"use client";

import { useEffect, useCallback } from "react";
import { useCampaignStore } from "../stores/campaign-store";
import { useRealtime } from "./use-realtime";
import type { Job } from "../types";

export function useJobs(campaignId?: string) {
  const { activeJobs, setActiveJobs, updateJob } = useCampaignStore();

  // Subscribe to realtime job updates
  const { lastChange } = useRealtime<Job>({
    table: "jobs",
    filter: campaignId
      ? `campaign_id=eq.${campaignId}`
      : undefined,
  });

  // When a realtime change comes in, update the store
  useEffect(() => {
    if (!lastChange?.new) return;
    updateJob(lastChange.new);
  }, [lastChange, updateJob]);

  const loadJobs = useCallback(
    async (campId: string) => {
      const res = await fetch(
        `/api/campaigns/${campId}?include=jobs`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) setActiveJobs(data.jobs);
      }
    },
    [setActiveJobs]
  );

  const hasRunningJobs = activeJobs.some(
    (j) => j.status === "pending" || j.status === "running"
  );

  return {
    activeJobs,
    setActiveJobs,
    hasRunningJobs,
    loadJobs,
  };
}
