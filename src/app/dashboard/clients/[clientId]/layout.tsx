"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  Palette,
  Megaphone,
  Building2,
  Loader2,
} from "lucide-react";
import { useClient } from "@/lib/hooks/use-client";

const NAV_ITEMS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/brand-kits", label: "Brand Kits", icon: Palette },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
];

export default function ClientDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const clientId = params.clientId as string;
  const { client, isLoading } = useClient(clientId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-muted-foreground">Client not found.</p>
        <Link
          href="/dashboard/clients"
          className="text-primary text-sm mt-2 inline-block"
        >
          Back to clients
        </Link>
      </div>
    );
  }

  const basePath = `/dashboard/clients/${clientId}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Clients
      </Link>

      {/* Client header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {client.logo_url ? (
            <img
              src={client.logo_url}
              alt={client.name}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-2xl font-bold text-foreground">
                {client.name}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  client.status === "active"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {client.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {[client.industry, client.website?.replace(/^https?:\/\//, "")]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* Subnav */}
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

      {/* Content */}
      {children}
    </div>
  );
}
