"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  Megaphone,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import OrgSwitcher from "./OrgSwitcher";
import { useOrg } from "@/lib/hooks/use-org";
import type { Campaign } from "@/lib/types";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
];

const bottomItems = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

/* ─── status → dot color mapping ─── */
function statusDotColor(status: Campaign["status"]): string {
  switch (status) {
    case "draft":
      return "bg-zinc-400";
    case "researching":
    case "ideation":
      return "bg-yellow-400";
    case "creating":
      return "bg-blue-400";
    case "review":
      return "bg-purple-400";
    case "deployed":
    case "monitoring":
      return "bg-green-400";
    case "paused":
      return "bg-orange-400";
    case "complete":
      return "bg-emerald-400";
    default:
      return "bg-zinc-400";
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { currentOrg, isSuperAdmin } = useOrg();

  /* ─── campaigns state ─── */
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignsOpen, setCampaignsOpen] = useState(true);

  const loadCampaigns = useCallback(async (orgId: string) => {
    setCampaignsLoading(true);
    try {
      const res = await fetch(`/api/campaigns?org_id=${orgId}`);
      if (res.ok) {
        const data: Campaign[] = await res.json();
        // Sort by updated_at desc, take top 8
        const sorted = data
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          )
          .slice(0, 8);
        setCampaigns(sorted);
      }
    } catch {
      // Silently fail — sidebar shouldn't block on campaign fetch
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentOrg?.id) {
      loadCampaigns(currentOrg.id);
    } else {
      setCampaigns([]);
    }
  }, [currentOrg?.id, loadCampaigns]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col h-full shrink-0">
      {/* Org Switcher */}
      <div className="p-3 border-b border-border">
        <OrgSwitcher />
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* ─── Campaigns section ─── */}
        <div className="pt-4">
          {/* Section header */}
          <div className="flex items-center justify-between px-3 pb-1">
            <button
              onClick={() => setCampaignsOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              {campaignsOpen ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              Campaigns
            </button>
            <Link
              href="/dashboard/campaigns/new"
              className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="New campaign"
            >
              <Plus className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Campaign list */}
          {campaignsOpen && (
            <div className="space-y-0.5 mt-0.5">
              {campaignsLoading ? (
                /* Loading skeletons */
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-1.5"
                    >
                      <div className="w-2 h-2 rounded-full bg-muted animate-pulse shrink-0" />
                      <div className="h-3.5 bg-muted animate-pulse rounded flex-1" />
                    </div>
                  ))}
                </>
              ) : campaigns.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground/60">
                  No campaigns yet
                </p>
              ) : (
                <>
                  {campaigns.map((campaign) => {
                    const active = pathname.startsWith(
                      `/dashboard/campaigns/${campaign.id}`
                    );
                    return (
                      <Link
                        key={campaign.id}
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${statusDotColor(campaign.status)}`}
                          title={campaign.status}
                        />
                        <span className="truncate">{campaign.name}</span>
                      </Link>
                    );
                  })}
                  <Link
                    href="/dashboard/campaigns"
                    className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <Megaphone className="w-3 h-3 shrink-0" />
                    View all campaigns
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Admin section */}
        {isSuperAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </span>
            </div>
            <Link
              href="/admin"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/admin")
                  ? "bg-amber-500/10 text-amber-600 font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Nav */}
      <div className="p-2 border-t border-border space-y-0.5">
        {bottomItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
