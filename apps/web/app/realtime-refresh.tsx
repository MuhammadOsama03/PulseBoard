"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type ConnectionState = "connecting" | "live" | "offline";

const workspaceEvents = [
  "project:created",
  "project:updated",
  "task:created",
  "task:updated",
  "activity:created",
] as const;

export function RealtimeRefresh({ apiUrl }: { apiUrl: string }) {
  const router = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const socket = io(apiUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };

    socket.on("connect", () => setConnectionState("live"));
    socket.on("disconnect", () => setConnectionState("offline"));
    socket.on("connect_error", () => setConnectionState("offline"));
    workspaceEvents.forEach((event) => socket.on(event, scheduleRefresh));

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      workspaceEvents.forEach((event) => socket.off(event, scheduleRefresh));
      socket.disconnect();
    };
  }, [apiUrl, router]);

  return (
    <span
      role="status"
      aria-live="polite"
      title="PulseBoard realtime connection"
      style={{
        border: "1px solid rgba(148,163,184,.25)",
        borderRadius: 999,
        color: connectionState === "live" ? "#6ee7b7" : "#91a3ba",
        padding: "0.55rem 0.85rem",
        whiteSpace: "nowrap",
      }}
    >
      Realtime: {connectionState}
    </span>
  );
}
