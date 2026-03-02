"use client";

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  table: string;
  schema?: string;
  filter?: string; // e.g. "org_id=eq.abc123"
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
}

interface RealtimeChange<T> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: Partial<T> | null;
}

export function useRealtime<T extends object>(
  options: UseRealtimeOptions
) {
  const [lastChange, setLastChange] = useState<RealtimeChange<T> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const channelName = `realtime-${options.table}-${options.filter || "all"}`;

    // Build the channel config
    const filterConfig: {
      event: "INSERT" | "UPDATE" | "DELETE" | "*";
      schema: string;
      table: string;
      filter?: string;
    } = {
      event: options.event || "*",
      schema: options.schema || "public",
      table: options.table,
    };

    if (options.filter) {
      filterConfig.filter = options.filter;
    }

    channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        filterConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          setLastChange({
            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
            new: (payload.new as T) || null,
            old: (payload.old as Partial<T>) || null,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.table, options.filter, options.event, options.schema]);

  return { lastChange, isConnected };
}
