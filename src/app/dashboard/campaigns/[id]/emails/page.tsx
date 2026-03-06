"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Wand2,
  Plus,
  AlertCircle,
  Check,
  Calendar,
} from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import { useJobs } from "@/lib/hooks/use-jobs";
import { useCampaignStore } from "@/lib/stores/campaign-store";
import JobProgress from "@/components/shared/JobProgress";
import EmailBriefForm from "@/components/email/EmailBriefForm";
import type {
  BrandKit,
  MessagingFramework,
  EmailCampaign,
  EmailCampaignBrief,
} from "@/lib/types";

export default function EmailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentOrg } = useOrg();
  const { activeJobs, loadJobs } = useJobs(id);
  const { setEmailCampaigns, emailCampaigns } = useCampaignStore();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard data
  const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [selectedBrandKit, setSelectedBrandKit] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(
    null
  );
  const [campaignName, setCampaignName] = useState("Email Campaign");
  const [brief, setBrief] = useState<EmailCampaignBrief>({
    total_emails: 6,
    frequency: "weekly",
    urgency_level: "medium",
    email_types: ["appeal", "update", "thank-you"],
  });

  // Load email campaigns + brand kits + frameworks
  const loadEmailCampaigns = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/email-campaigns?campaign_id=${id}`);
      if (res.ok) {
        const data: EmailCampaign[] = await res.json();
        setEmailCampaigns(data);
      }
    } catch {
      // falls through
    }
  }, [id, setEmailCampaigns]);

  useEffect(() => {
    async function load() {
      if (!id || !currentOrg) return;
      try {
        const [ecRes, bkRes, fwRes] = await Promise.all([
          fetch(`/api/email-campaigns?campaign_id=${id}`),
          fetch(`/api/brand-kits?org_id=${currentOrg.id}&campaign_id=${id}`),
          fetch(`/api/frameworks?campaign_id=${id}`),
        ]);

        if (ecRes.ok) {
          const ecData: EmailCampaign[] = await ecRes.json();
          setEmailCampaigns(ecData);
        }
        if (bkRes.ok) {
          const bkData: BrandKit[] = await bkRes.json();
          setBrandKits(bkData);
          const firstActive = bkData.find((k) => k.status === "active");
          if (firstActive) setSelectedBrandKit(firstActive.id);
        }
        if (fwRes.ok) {
          const fwData: MessagingFramework[] = await fwRes.json();
          setFrameworks(fwData);
          const firstComplete = fwData.find((f) => f.status === "complete");
          if (firstComplete) setSelectedFramework(firstComplete.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    if (id) loadJobs(id);
  }, [id, currentOrg, setEmailCampaigns, loadJobs]);

  const handleGenerate = async () => {
    if (!selectedBrandKit || !selectedFramework) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/agents/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_id: id,
          brand_kit_id: selectedBrandKit,
          framework_id: selectedFramework,
          brief,
          name: campaignName,
        }),
      });

      if (res.ok) {
        const { emailCampaignId } = await res.json();
        if (id) loadJobs(id);
        // Reload email campaigns list
        await loadEmailCampaigns();
        setShowWizard(false);
        // Navigate to the new campaign
        if (emailCampaignId) {
          router.push(
            `/dashboard/campaigns/${id}/emails/${emailCampaignId}`
          );
        }
      } else {
        const err = await res.json();
        console.error("Failed to start email generation:", err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Active email jobs
  const emailJobs = activeJobs.filter((j) => j.type === "email");
  const runningJob = emailJobs.find(
    (j) => j.status === "pending" || j.status === "running"
  );
  const lastCompleted = emailJobs.find((j) => j.status === "completed");

  // Reload when job completes
  useEffect(() => {
    if (lastCompleted) {
      loadEmailCampaigns();
    }
  }, [lastCompleted, loadEmailCampaigns]);

  const activeBrandKits = brandKits.filter((k) => k.status === "active");
  const completeFrameworks = frameworks.filter((f) => f.status === "complete");

  const canGenerate =
    !!selectedBrandKit && !!selectedFramework && !generating && !runningJob;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Email Campaigns
          </h2>
          <p className="text-sm text-muted-foreground">
            Generate and manage email campaign series with AI
          </p>
        </div>
        {emailCampaigns.length > 0 && !showWizard && (
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Email Campaign
          </button>
        )}
      </div>

      {/* Active email jobs */}
      {emailJobs.length > 0 && (
        <div className="space-y-2">
          {emailJobs
            .filter((j) => j.status !== "completed")
            .map((job) => (
              <JobProgress key={job.id} job={job} />
            ))}
        </div>
      )}

      {/* Wizard */}
      {(emailCampaigns.length === 0 || showWizard) && !runningJob && (
        <div className="space-y-6">
          {/* Prerequisites check */}
          {(activeBrandKits.length === 0 ||
            completeFrameworks.length === 0) && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Prerequisites Missing
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  {activeBrandKits.length === 0 && (
                    <li>
                      • No active brand kits.{" "}
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/campaigns/${id}/brand-kits`
                          )
                        }
                        className="text-primary hover:underline"
                      >
                        Create a brand kit →
                      </button>
                    </li>
                  )}
                  {completeFrameworks.length === 0 && (
                    <li>
                      • No complete messaging frameworks.{" "}
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/campaigns/${id}/frameworks`
                          )
                        }
                        className="text-primary hover:underline"
                      >
                        Create a framework →
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeBrandKits.length > 0 && completeFrameworks.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <Wand2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  {showWizard
                    ? "Create New Email Campaign"
                    : "Generate Your First Email Campaign"}
                </h3>
              </div>

              <EmailBriefForm
                brief={brief}
                onChange={setBrief}
                campaignName={campaignName}
                onCampaignNameChange={setCampaignName}
                brandKits={brandKits}
                frameworks={frameworks}
                selectedBrandKitId={selectedBrandKit}
                selectedFrameworkId={selectedFramework}
                onBrandKitChange={setSelectedBrandKit}
                onFrameworkChange={setSelectedFramework}
              />

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {generating || runningJob ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  {runningJob
                    ? "Generating..."
                    : `Generate ${brief.total_emails || 6} Emails`}
                </button>
                {showWizard && (
                  <button
                    onClick={() => setShowWizard(false)}
                    className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email campaigns list */}
      {emailCampaigns.length > 0 && !showWizard && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailCampaigns.map((ec) => {
            const statusColor =
              ec.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : ec.status === "generating"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : ec.status === "complete"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

            return (
              <button
                key={ec.id}
                onClick={() =>
                  router.push(
                    `/dashboard/campaigns/${id}/emails/${ec.id}`
                  )
                }
                className="bg-card rounded-xl border border-border p-5 text-left hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      {ec.name}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColor}`}
                  >
                    {ec.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {ec.brief?.total_emails && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3" />
                      <span>
                        {ec.brief.total_emails} emails •{" "}
                        {ec.brief.frequency || "weekly"}
                      </span>
                    </div>
                  )}
                  {ec.brief?.start_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Starts{" "}
                        {new Date(
                          ec.brief.start_date + "T00:00:00"
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-muted-foreground/60 mt-3">
                  Created{" "}
                  {new Date(ec.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Completion notice */}
      {lastCompleted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-foreground">
              Email campaign generated!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
