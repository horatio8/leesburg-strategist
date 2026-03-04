"use client";

import Link from "next/link";
import { Clock, ChevronRight, Globe, Building2 } from "lucide-react";
import type { Client } from "@/lib/types";

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="group block bg-card rounded-xl border border-border hover:border-primary/30 transition-all"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            {client.logo_url ? (
              <img
                src={client.logo_url}
                alt={client.name}
                className="w-8 h-8 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <h3 className="font-semibold text-foreground truncate">
              {client.name}
            </h3>
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
          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-11">
            {client.industry && (
              <span className="truncate max-w-[200px]">{client.industry}</span>
            )}
            {client.website && (
              <span className="flex items-center gap-1 truncate max-w-[200px]">
                <Globe className="w-3 h-3" />
                {client.website.replace(/^https?:\/\//, "")}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {formatDate(client.updated_at)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors ml-4 shrink-0" />
      </div>
    </Link>
  );
}
