"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Palette,
  CheckCircle2,
  Settings,
  Shield,
  FileText,
} from "lucide-react";
import OrgSwitcher from "./OrgSwitcher";
import { useOrg } from "@/lib/hooks/use-org";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Campaigns",
    href: "/dashboard/campaigns",
    icon: Megaphone,
  },
  {
    label: "Brand Kits",
    href: "/dashboard/brand-kits",
    icon: Palette,
  },
  {
    label: "Approvals",
    href: "/dashboard/approvals",
    icon: CheckCircle2,
  },
  {
    label: "Frameworks",
    href: "/dashboard/frameworks",
    icon: FileText,
    description: "Messaging frameworks",
  },
];

const bottomItems = [
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSuperAdmin } = useOrg();

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
