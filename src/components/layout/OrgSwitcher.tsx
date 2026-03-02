"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Check, Shield } from "lucide-react";
import { useOrg } from "@/lib/hooks/use-org";
import type { Organization } from "@/lib/types";

export default function OrgSwitcher() {
  const { currentOrg, userOrgs, isSuperAdmin, switchOrg } = useOrg();
  const [isOpen, setIsOpen] = useState(false);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For super admin: fetch all orgs
  useEffect(() => {
    if (isSuperAdmin && isOpen && allOrgs.length === 0) {
      fetch("/api/orgs")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAllOrgs(data);
        });
    }
  }, [isSuperAdmin, isOpen, allOrgs.length]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayOrgs = isSuperAdmin ? allOrgs : userOrgs;

  if (!currentOrg) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted/50 transition-colors w-full"
      >
        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="truncate">{currentOrg.name}</span>
        {isSuperAdmin && (
          <Shield className="w-3 h-3 text-amber-500 shrink-0" />
        )}
        <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 ml-auto" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-1.5 max-h-64 overflow-y-auto">
            {displayOrgs.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  switchOrg(org);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left hover:bg-muted/50 transition-colors"
              >
                <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{org.name}</span>
                {currentOrg.id === org.id && (
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </div>
          {isSuperAdmin && (
            <div className="border-t border-border px-3 py-2">
              <span className="text-xs text-amber-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Super Admin — viewing all orgs
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
