"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Download,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import EmailTimelineCard from "@/components/email/EmailTimelineCard";
import type {
  EmailCampaign,
  EmailCampaignEmail,
  BrandKit,
} from "@/lib/types";

export default function EmailCampaignDetailPage() {
  const { id, emailCampaignId } = useParams<{
    id: string;
    emailCampaignId: string;
  }>();
  const router = useRouter();
  const { currentOrg } = useOrg();

  const [loading, setLoading] = useState(true);
  const [emailCampaign, setEmailCampaign] = useState<EmailCampaign | null>(
    null
  );
  const [emails, setEmails] = useState<EmailCampaignEmail[]>([]);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  const loadData = useCallback(async () => {
    if (!emailCampaignId) return;
    try {
      const [ecRes, emailsRes] = await Promise.all([
        fetch(`/api/email-campaigns/${emailCampaignId}`),
        fetch(`/api/email-campaigns/${emailCampaignId}/emails`),
      ]);

      if (ecRes.ok) {
        const ecData: EmailCampaign = await ecRes.json();
        setEmailCampaign(ecData);

        // Fetch brand kit if available
        if (ecData.brand_kit_id) {
          const bkRes = await fetch(`/api/brand-kits/${ecData.brand_kit_id}`);
          if (bkRes.ok) {
            setBrandKit(await bkRes.json());
          }
        }
      }

      if (emailsRes.ok) {
        const emailsData: EmailCampaignEmail[] = await emailsRes.json();
        setEmails(emailsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [emailCampaignId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportAll = async () => {
    // Open each email's HTML in sequence for copying
    for (const email of emails) {
      try {
        const res = await fetch(
          `/api/email-campaigns/${emailCampaignId}/export?emailId=${email.id}`
        );
        if (res.ok) {
          const { html } = await res.json();
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `email-${email.sequence_number}-${email.subject.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error(`Failed to export email ${email.id}:`, err);
      }
    }
  };

  const statusColor =
    emailCampaign?.status === "active"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : emailCampaign?.status === "generating"
        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
        : emailCampaign?.status === "complete"
          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!emailCampaign) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">
          Email campaign not found.
        </p>
        <Link
          href={`/dashboard/campaigns/${id}/emails`}
          className="text-primary hover:underline text-sm mt-2 inline-block"
        >
          ← Back to Email Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <button
          onClick={() => router.push(`/dashboard/campaigns/${id}/emails`)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Email Campaigns
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {emailCampaign.name}
              </h2>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${statusColor}`}
              >
                {emailCampaign.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {emails.length} email{emails.length !== 1 ? "s" : ""} in series
              {emailCampaign.brief?.frequency &&
                ` • ${emailCampaign.brief.frequency}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            {emails.length > 0 && (
              <button
                onClick={handleExportAll}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export All HTML
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats summary */}
      {emails.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {emails.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Emails</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {emails.filter((e) => e.status === "draft").length}
              </p>
              <p className="text-xs text-muted-foreground">Draft</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {emails.filter((e) => e.status === "approved").length}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {new Set(emails.map((e) => e.email_type)).size}
              </p>
              <p className="text-xs text-muted-foreground">Email Types</p>
            </div>
          </div>
        </div>
      )}

      {/* Email timeline */}
      {emails.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-foreground mb-1">
            No Emails Yet
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {emailCampaign.status === "generating"
              ? "Emails are being generated. This may take a minute..."
              : "This email campaign has no emails."}
          </p>
          {emailCampaign.status === "generating" && (
            <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Email Timeline
          </h3>
          <div className="space-y-2">
            {emails.map((email) => (
              <EmailTimelineCard
                key={email.id}
                email={email}
                onClick={() =>
                  router.push(
                    `/dashboard/campaigns/${id}/emails/${emailCampaignId}/${email.id}`
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
