"use client";

import { Check } from "lucide-react";
import type { EmailCampaignBrief, BrandKit, MessagingFramework } from "@/lib/types";

const EMAIL_TYPES = [
  { key: "appeal", label: "Appeal" },
  { key: "update", label: "Update" },
  { key: "thank-you", label: "Thank You" },
  { key: "reminder", label: "Reminder" },
  { key: "event", label: "Event" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

interface EmailBriefFormProps {
  brief: EmailCampaignBrief;
  onChange: (brief: EmailCampaignBrief) => void;
  campaignName: string;
  onCampaignNameChange: (name: string) => void;
  brandKits: BrandKit[];
  frameworks: MessagingFramework[];
  selectedBrandKitId: string | null;
  selectedFrameworkId: string | null;
  onBrandKitChange: (id: string) => void;
  onFrameworkChange: (id: string) => void;
}

export default function EmailBriefForm({
  brief,
  onChange,
  campaignName,
  onCampaignNameChange,
  brandKits,
  frameworks,
  selectedBrandKitId,
  selectedFrameworkId,
  onBrandKitChange,
  onFrameworkChange,
}: EmailBriefFormProps) {
  const updateBrief = (partial: Partial<EmailCampaignBrief>) => {
    onChange({ ...brief, ...partial });
  };

  const toggleEmailType = (type: string) => {
    const current = brief.email_types || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateBrief({ email_types: updated });
  };

  const activeBrandKits = brandKits.filter((k) => k.status === "active");
  const completeFrameworks = frameworks.filter((f) => f.status === "complete");

  return (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Campaign Name
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => onCampaignNameChange(e.target.value)}
          placeholder="e.g., Spring Fundraising Series"
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Brand Kit Selection */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Brand Kit
        </label>
        {activeBrandKits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active brand kits available.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeBrandKits.map((kit) => {
              const colorValues = Object.values(kit.colors || {});
              const isSelected = selectedBrandKitId === kit.id;
              return (
                <button
                  key={kit.id}
                  type="button"
                  onClick={() => onBrandKitChange(kit.id)}
                  className={`bg-card rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {colorValues.length > 0 && (
                    <div className="flex rounded overflow-hidden h-4 mb-2 border border-border">
                      {colorValues.slice(0, 6).map((c, i) => (
                        <div
                          key={i}
                          className="flex-1"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {kit.name}
                    </p>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Framework Selection */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Messaging Framework
        </label>
        {completeFrameworks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No complete frameworks available.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {completeFrameworks.map((fw) => {
              const isSelected = selectedFrameworkId === fw.id;
              return (
                <button
                  key={fw.id}
                  type="button"
                  onClick={() => onFrameworkChange(fw.id)}
                  className={`bg-card rounded-lg border p-3 text-left transition-colors ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {fw.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {fw.name || "Unnamed"} • {fw.entity_type}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Purpose / Goal */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Purpose / Goal
        </label>
        <textarea
          rows={3}
          value={brief.purpose || ""}
          onChange={(e) => updateBrief({ purpose: e.target.value })}
          placeholder="What is the primary goal of this email campaign?"
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Number of Emails & Frequency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Number of Emails
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={brief.total_emails || 6}
            onChange={(e) =>
              updateBrief({ total_emails: parseInt(e.target.value) || 6 })
            }
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Frequency
          </label>
          <select
            value={brief.frequency || "weekly"}
            onChange={(e) => updateBrief({ frequency: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Email Types */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Email Types
        </label>
        <div className="flex flex-wrap gap-2">
          {EMAIL_TYPES.map((type) => {
            const isSelected = (brief.email_types || []).includes(type.key);
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => toggleEmailType(type.key)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency & Start Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Urgency Level
          </label>
          <select
            value={brief.urgency_level || "medium"}
            onChange={(e) => updateBrief({ urgency_level: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {URGENCY_LEVELS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={brief.start_date || ""}
            onChange={(e) => updateBrief({ start_date: e.target.value })}
            className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Tone Notes */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Tone Notes{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          rows={2}
          value={brief.tone_notes || ""}
          onChange={(e) => updateBrief({ tone_notes: e.target.value })}
          placeholder="Any specific tone or style preferences for the emails..."
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Additional Context */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-1.5">
          Additional Context{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={brief.additional_context || ""}
          onChange={(e) => updateBrief({ additional_context: e.target.value })}
          placeholder="Any other details, special events, deadlines, or considerations..."
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
    </div>
  );
}
