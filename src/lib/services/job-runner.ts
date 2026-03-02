import { SupabaseClient } from "@supabase/supabase-js";

interface CreateJobOptions {
  campaign_id?: string;
  org_id: string;
  type: string;
  input?: Record<string, unknown>;
  started_by?: string;
}

/**
 * Creates a new job in the jobs table and returns it.
 * The caller is responsible for running the actual work and updating status.
 */
export async function createJob(
  supabase: SupabaseClient,
  options: CreateJobOptions
) {
  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      campaign_id: options.campaign_id || null,
      org_id: options.org_id,
      type: options.type,
      status: "pending",
      input: options.input || {},
      started_by: options.started_by || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create job: ${error.message}`);
  return job;
}

/**
 * Marks a job as running.
 */
export async function startJob(supabase: SupabaseClient, jobId: string) {
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) throw new Error(`Failed to start job: ${error.message}`);
}

/**
 * Marks a job as completed with results.
 */
export async function completeJob(
  supabase: SupabaseClient,
  jobId: string,
  result: Record<string, unknown>
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "completed",
      result,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) throw new Error(`Failed to complete job: ${error.message}`);
}

/**
 * Marks a job as failed with an error message.
 */
export async function failJob(
  supabase: SupabaseClient,
  jobId: string,
  errorMessage: string
) {
  const { error } = await supabase
    .from("jobs")
    .update({
      status: "failed",
      error: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error)
    console.error(`Failed to mark job as failed: ${error.message}`);
}

/**
 * Logs a decision in the decisions_log table for transparency.
 */
export async function logDecision(
  supabase: SupabaseClient,
  options: {
    campaign_id: string;
    agent: string;
    decision_type: string;
    decision: string;
    reasoning?: string;
    evidence?: Record<string, unknown>;
    alternatives_considered?: Array<Record<string, unknown>>;
    confidence?: number;
    reversible?: boolean;
  }
) {
  const { error } = await supabase.from("decisions_log").insert({
    campaign_id: options.campaign_id,
    agent: options.agent,
    decision_type: options.decision_type,
    decision: options.decision,
    reasoning: options.reasoning || null,
    evidence: options.evidence || {},
    alternatives_considered: options.alternatives_considered || [],
    confidence: options.confidence ?? 0.5,
    reversible: options.reversible ?? true,
  });

  if (error)
    console.error(`Failed to log decision: ${error.message}`);
}
