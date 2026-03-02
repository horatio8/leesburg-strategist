"use client";

import { useEffect, useState } from "react";
import { Building2, Globe, Calendar, Loader2 } from "lucide-react";
import type { Organization } from "@/lib/types";

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orgs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrgs(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          All Organizations
        </h1>
        <p className="text-sm text-muted-foreground">
          {orgs.length} organization{orgs.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organization
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Industry
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Website
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orgs.map((org) => (
              <tr
                key={org.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {org.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {org.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {org.industry || "—"}
                </td>
                <td className="px-4 py-3">
                  {org.website ? (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      {org.website}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(org.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orgs.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No organizations found.
          </div>
        )}
      </div>
    </div>
  );
}
