"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./use-realtime";
import type { Job } from "../types";

/**
 * Hook for tracking brand kit extraction/generation jobs via Realtime.
 * Filters jobs by type (brand_extraction, brand_generation) and watches
 * for a specific job by ID.
 */
export function useBrandKitJobs(jobId?: string | null) {
  const [job, setJob] = useState<Job | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Subscribe to realtime job updates for the specific job
  const { lastChange } = useRealtime<Job>({
    table: "jobs",
    filter: jobId ? `id=eq.${jobId}` : undefined,
  });

  // When a realtime change comes in, update state
  useEffect(() => {
    if (!lastChange?.new) return;
    const updated = lastChange.new;
    setJob(updated);
    setIsRunning(
      updated.status === "pending" || updated.status === "running"
    );
    setIsComplete(updated.status === "completed");
    setIsFailed(updated.status === "failed");
  }, [lastChange]);

  // Polling fallback: fetch job status directly
  const pollJob = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data);
        setIsRunning(
          data.status === "pending" || data.status === "running"
        );
        setIsComplete(data.status === "completed");
        setIsFailed(data.status === "failed");
      }
    } catch {
      // Silently fail — rely on realtime
    }
  }, [jobId]);

  // Poll every 3 seconds while job is running (fallback for realtime)
  useEffect(() => {
    if (!jobId || !isRunning) return;
    const interval = setInterval(pollJob, 3000);
    return () => clearInterval(interval);
  }, [jobId, isRunning, pollJob]);

  // Initial fetch when jobId changes
  useEffect(() => {
    if (jobId) pollJob();
  }, [jobId, pollJob]);

  return {
    job,
    isRunning,
    isComplete,
    isFailed,
    pollJob,
  };
}
