"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Save,
  Copy,
  Download,
  Check,
  Eye,
  Edit3,
} from "lucide-react";
import EmailPreview from "@/components/email/EmailPreview";
import type { EmailCampaignEmail, BrandKit, EmailCampaign } from "@/lib/types";

const EMAIL_TYPES = [
  { value: "appeal", label: "Appeal" },
  { value: "update", label: "Update" },
  { value: "thank-you", label: "Thank You" },
  { value: "reminder", label: "Reminder" },
  { value: "event", label: "Event" },
];

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
];

export default function EmailEditorPage() {
  const { id, emailCampaignId, emailId } = useParams<{
    id: string;
    emailCampaignId: string;
    emailId: string;
  }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const [email, setEmail] = useState<EmailCampaignEmail | null>(null);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);

  // Form state
  const [form, setForm] = useState<{
    subject: string;
    preview_text: string;
    heading_image_prompt: string;
    heading_image_url: string;
    introduction: string;
    body: string;
    cta_text: string;
    cta_url: string;
    signature: string;
    email_type: string;
    send_date: string;
    status: "draft" | "review" | "approved" | "sent";
  }>({
    subject: "",
    preview_text: "",
    heading_image_prompt: "",
    heading_image_url: "",
    introduction: "",
    body: "",
    cta_text: "",
    cta_url: "",
    signature: "",
    email_type: "appeal",
    send_date: "",
    status: "draft",
  });

  const loadData = useCallback(async () => {
    if (!emailCampaignId || !emailId) return;
    try {
      const [emailRes, ecRes] = await Promise.all([
        fetch(`/api/email-campaigns/${emailCampaignId}/emails/${emailId}`),
        fetch(`/api/email-campaigns/${emailCampaignId}`),
      ]);

      if (emailRes.ok) {
        const emailData: EmailCampaignEmail = await emailRes.json();
        setEmail(emailData);
        setForm({
          subject: emailData.subject || "",
          preview_text: emailData.preview_text || "",
          heading_image_prompt: emailData.heading_image_prompt || "",
          heading_image_url: emailData.heading_image_url || "",
          introduction: emailData.introduction || "",
          body: emailData.body || "",
          cta_text: emailData.cta_text || "",
          cta_url: emailData.cta_url || "",
          signature: emailData.signature || "",
          email_type: emailData.email_type || "appeal",
          send_date: emailData.send_date || "",
          status: (emailData.status as "draft" | "review" | "approved" | "sent") || "draft",
        });
      }

      if (ecRes.ok) {
        const ecData: EmailCampaign = await ecRes.json();
        if (ecData.brand_kit_id) {
          const bkRes = await fetch(`/api/brand-kits/${ecData.brand_kit_id}`);
          if (bkRes.ok) {
            setBrandKit(await bkRes.json());
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [emailCampaignId, emailId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateForm = (field: keyof typeof form, value: string) => {
    if (field === "status") {
      setForm((prev) => ({
        ...prev,
        status: value as "draft" | "review" | "approved" | "sent",
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!emailCampaignId || !emailId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/email-campaigns/${emailCampaignId}/emails/${emailId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) {
        const updated: EmailCampaignEmail = await res.json();
        setEmail(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyHtml = async () => {
    if (!emailCampaignId || !emailId) return;
    try {
      // Save first
      await handleSave();
      const res = await fetch(
        `/api/email-campaigns/${emailCampaignId}/export?emailId=${emailId}`
      );
      if (res.ok) {
        const { html } = await res.json();
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportHtml = async () => {
    if (!emailCampaignId || !emailId) return;
    try {
      await handleSave();
      const res = await fetch(
        `/api/email-campaigns/${emailCampaignId}/export?emailId=${emailId}`
      );
      if (res.ok) {
        const { html } = await res.json();
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `email-${form.subject.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-") || "untitled"}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create a preview object from form state
  const previewEmail: EmailCampaignEmail = {
    id: email?.id || "",
    email_campaign_id: email?.email_campaign_id || emailCampaignId || "",
    sequence_number: email?.sequence_number || 1,
    send_date: form.send_date || null,
    subject: form.subject,
    preview_text: form.preview_text,
    heading_image_prompt: form.heading_image_prompt,
    heading_image_url: form.heading_image_url,
    introduction: form.introduction,
    body: form.body,
    cta_text: form.cta_text,
    cta_url: form.cta_url,
    signature: form.signature,
    email_type: form.email_type,
    status: form.status,
    created_at: email?.created_at || new Date().toISOString(),
    updated_at: email?.updated_at || new Date().toISOString(),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Email not found.</p>
        <button
          onClick={() =>
            router.push(
              `/dashboard/campaigns/${id}/emails/${emailCampaignId}`
            )
          }
          className="text-primary hover:underline text-sm mt-2"
        >
          ← Back to Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() =>
              router.push(
                `/dashboard/campaigns/${id}/emails/${emailCampaignId}`
              )
            }
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Campaign
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            Email #{email.sequence_number}: {form.subject || "Untitled"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile tab toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden lg:hidden">
            <button
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "edit"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground"
              }`}
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
          </div>

          <button
            onClick={handleCopyHtml}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy HTML"}
          </button>
          <button
            onClick={handleExportHtml}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Edit form */}
        <div
          className={`space-y-4 ${activeTab === "preview" ? "hidden lg:block" : ""}`}
        >
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => updateForm("subject", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Preview text */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Preview Text
              </label>
              <input
                type="text"
                value={form.preview_text}
                onChange={(e) => updateForm("preview_text", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Shown after subject in inbox"
              />
            </div>

            {/* Heading image prompt */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Heading Image Prompt
              </label>
              <textarea
                rows={2}
                value={form.heading_image_prompt}
                onChange={(e) =>
                  updateForm("heading_image_prompt", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Heading image URL */}
            {form.heading_image_url && (
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Heading Image URL
                </label>
                <input
                  type="text"
                  value={form.heading_image_url}
                  onChange={(e) =>
                    updateForm("heading_image_url", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}

            {/* Introduction */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Introduction
              </label>
              <textarea
                rows={3}
                value={form.introduction}
                onChange={(e) => updateForm("introduction", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Body
              </label>
              <textarea
                rows={8}
                value={form.body}
                onChange={(e) => updateForm("body", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Separate paragraphs with blank lines
              </p>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => updateForm("cta_text", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  CTA URL
                </label>
                <input
                  type="text"
                  value={form.cta_url}
                  onChange={(e) => updateForm("cta_url", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="https://"
                />
              </div>
            </div>

            {/* Signature */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Signature
              </label>
              <textarea
                rows={2}
                value={form.signature}
                onChange={(e) => updateForm("signature", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            {/* Type, Date, Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Email Type
                </label>
                <select
                  value={form.email_type}
                  onChange={(e) => updateForm("email_type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {EMAIL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Send Date
                </label>
                <input
                  type="date"
                  value={form.send_date}
                  onChange={(e) => updateForm("send_date", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live preview */}
        <div
          className={`${activeTab === "edit" ? "hidden lg:block" : ""}`}
        >
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Live Preview
              </h3>
              <span className="text-[10px] text-muted-foreground">
                600px email width
              </span>
            </div>
            <div className="bg-muted/20 rounded-xl p-4 overflow-auto max-h-[calc(100vh-180px)]">
              <EmailPreview email={previewEmail} brandKit={brandKit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
