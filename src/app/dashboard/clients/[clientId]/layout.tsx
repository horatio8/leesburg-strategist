import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import ClientDetailNav from "@/components/clients/ClientDetailNav";
import type { Client } from "@/lib/types";

export default async function ClientDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const admin = createServiceClient();

  const { data: client, error } = await admin
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error || !client) {
    notFound();
  }

  const typedClient = client as Client;

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
          {typedClient.logo_url ? (
            <img
              src={typedClient.logo_url}
              alt={typedClient.name}
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
                {typedClient.name}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  typedClient.status === "active"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {typedClient.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {[
                typedClient.industry,
                typedClient.website?.replace(/^https?:\/\//, ""),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      </div>

      {/* Subnav (client component — needs usePathname) */}
      <ClientDetailNav clientId={clientId} />

      {/* Content — renders immediately, no waterfall */}
      {children}
    </div>
  );
}
