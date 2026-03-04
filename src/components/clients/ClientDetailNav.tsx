"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Palette,
  Megaphone,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/brand-kits", label: "Brand Kits", icon: Palette },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
];

export default function ClientDetailNav({
  clientId,
}: {
  clientId: string;
}) {
  const pathname = usePathname();
  const basePath = `/dashboard/clients/${clientId}`;

  return (
    <div className="flex items-center gap-1 border-b border-border mb-6">
      {NAV_ITEMS.map((item) => {
        const href = `${basePath}${item.href}`;
        const isActive =
          item.href === ""
            ? pathname === basePath
            : pathname.startsWith(href);

        return (
          <Link
            key={item.href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
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
