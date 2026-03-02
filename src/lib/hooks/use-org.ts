"use client";

import { useEffect } from "react";
import { useOrgStore } from "../stores/org-store";
import { createClient } from "../supabase/client";
import type { Organization, OrgRole, Profile } from "../types";

export function useOrg() {
  const {
    currentOrg,
    setCurrentOrg,
    userOrgs,
    setUserOrgs,
    userRole,
    setUserRole,
    profile,
    setProfile,
    isSuperAdmin,
    setIsSuperAdmin,
    isLoading,
    setIsLoading,
  } = useOrgStore();

  useEffect(() => {
    let cancelled = false;

    async function loadOrgContext() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      const userProfile = profileData as Profile | null;
      setProfile(userProfile);
      setIsSuperAdmin(userProfile?.is_super_admin ?? false);

      // Load user's orgs via membership
      const { data: memberships } = await supabase
        .from("org_members")
        .select("org_id, role, organizations(*)")
        .eq("user_id", user.id);

      if (cancelled) return;

      if (memberships && memberships.length > 0) {
        const orgs = memberships
          .map((m) => m.organizations as unknown as Organization)
          .filter(Boolean);
        const roles = memberships.reduce(
          (acc, m) => {
            acc[m.org_id] = m.role as OrgRole;
            return acc;
          },
          {} as Record<string, OrgRole>
        );

        setUserOrgs(orgs);

        // If we don't have a current org, pick the first one
        if (!currentOrg && orgs.length > 0) {
          setCurrentOrg(orgs[0]);
          setUserRole(roles[orgs[0].id] || "member");
        } else if (currentOrg) {
          setUserRole(roles[currentOrg.id] || "member");
        }
      } else {
        setUserOrgs([]);
      }

      setIsLoading(false);
    }

    loadOrgContext();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchOrg = (org: Organization) => {
    setCurrentOrg(org);
    // Role will be refreshed on next render cycle
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("org_members")
        .select("role")
        .eq("org_id", org.id)
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setUserRole(data.role as OrgRole);
        });
    });
  };

  return {
    currentOrg,
    userOrgs,
    userRole,
    profile,
    isSuperAdmin,
    isLoading,
    switchOrg,
  };
}
