"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MessagingFramework } from "@/lib/types";
import {
  Plus,
  FileText,
  MapPin,
  Clock,
  Trash2,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const [frameworks, setFrameworks] = useState<MessagingFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const fetchFrameworks = async () => {
    try {
      const res = await fetch("/api/frameworks");
      if (res.ok) {
        const data = await res.json();
        setFrameworks(data);
      }
    } catch (err) {
      console.error("Failed to fetch frameworks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/frameworks", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/framework/${data.id}`);
      }
    } catch (err) {
      console.error("Failed to create framework:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this framework?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/frameworks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFrameworks((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete framework:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-slate-100 text-slate-600",
      in_progress: "bg-amber-100 text-amber-700",
      complete: "bg-green-100 text-green-700",
    };
    const labels: Record<string, string> = {
      draft: "Draft",
      in_progress: "In Progress",
      complete: "Complete",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}
      >
        {labels[status] || "Draft"}
      </span>
    );
  };

  const stepLabel = (step: number) => {
    const labels = ["", "Your Campaign", "Preliminary Research", "Strategy Workshop", "Final Playbook"];
    return labels[step] || "Your Campaign";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Messaging Frameworks</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your political messaging strategies
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {creating ? "Creating..." : "New Messaging Framework"}
        </button>
      </div>

      {/* Framework List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 animate-pulse"
            >
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : frameworks.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No frameworks yet</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Create your first messaging framework to get started
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Start New Messaging Framework
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className="group bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => router.push(`/framework/${fw.id}`)}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold truncate">
                      {fw.name?.trim() || fw.title || "Untitled Framework"}
                    </h3>
                    {statusBadge(fw.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {fw.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {fw.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(fw.updated_at)}
                    </span>
                    <span>Step: {stepLabel(fw.current_step)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(fw.id);
                    }}
                    disabled={deletingId === fw.id}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
