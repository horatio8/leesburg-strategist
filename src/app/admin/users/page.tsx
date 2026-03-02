"use client";

import { useEffect, useState } from "react";
import { User, Shield, Calendar, Loader2 } from "lucide-react";

interface AdminUser {
  id: string;
  display_name: string | null;
  is_super_admin: boolean;
  created_at: string;
  email?: string;
  org_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
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
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} user{users.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organizations
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr
                key={u.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {u.display_name || "Unnamed"}
                      </p>
                      {u.email && (
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.is_super_admin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500">
                      <Shield className="w-3 h-3" />
                      Super Admin
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">User</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {u.org_count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
