"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Shield } from "lucide-react";
import Link from "next/link";

interface AdminStats {
  totalOrgs: number;
  totalUsers: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalOrgs: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [orgsRes, usersRes] = await Promise.all([
          fetch("/api/admin/orgs"),
          fetch("/api/admin/users"),
        ]);
        const orgs = await orgsRes.json();
        const users = await usersRes.json();
        setStats({
          totalOrgs: Array.isArray(orgs) ? orgs.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
        });
      } catch {
        // Stats load failed silently
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
      label: "Organizations",
      value: stats.totalOrgs,
      icon: Building2,
      href: "/admin/orgs",
      description: "Manage all organizations",
    },
    {
      label: "Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      description: "Manage all users",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Super admin overview and management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-card border border-border rounded-xl p-6 hover:border-amber-500/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {isLoading ? "—" : card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {card.description}
                </p>
              </div>
              <card.icon className="w-8 h-8 text-muted-foreground/30 group-hover:text-amber-500/50 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
