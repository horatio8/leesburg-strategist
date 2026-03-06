"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Lightbulb,
  Palette,
  ScrollText,
  FileText,
  Sparkles,
  Wand2,
  Mail,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/brand-kits", label: "Brand Kits", icon: Palette },
  { href: "/frameworks", label: "Frameworks", icon: FileText },
  { href: "/generate", label: "Generate", icon: Wand2 },
  { href: "/creative", label: "Creative", icon: Sparkles },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/research", label: "Research", icon: Search },
  { href: "/strategy", label: "Strategy", icon: Lightbulb },
  { href: "/decisions", label: "Decisions", icon: ScrollText },
];

export default function CampaignDetailNav({
  campaignId,
}: {
  campaignId: string;
}) {
  const pathname = usePathname();
  const basePath = `/dashboard/campaigns/${campaignId}`;

  return (
    <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
      {NAV_ITEMS.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive = pathname.startsWith(href);

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
