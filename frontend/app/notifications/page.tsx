"use client";

import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import NotificationPanel from "../../components/notifications/NotificationPanel";
import { getNotifications } from "../../lib/api";
import type { Notification } from "../../lib/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendMissing, setBackendMissing] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    setBackendMissing(false);

    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err: unknown) {
      // Check if endpoint is 404 or 405 (missing controller in backend)
      const is404 =
        err instanceof Error &&
        (err.message.includes("404") ||
          err.message.toLowerCase().includes("not found") ||
          (err as { status?: number }).status === 404);

      if (is404) {
        setBackendMissing(true);
      } else {
        setError(
          err instanceof Error ? err.message : "Unable to load notifications."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">Inbox</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Notifications & Reminders
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Stay on schedule with automated notifications for scheduled trips and daily itinerary activities.
        </p>
      </div>

      <NotificationPanel
        notifications={notifications}
        loading={loading}
        error={error}
        onRefresh={loadNotifications}
        backendEndpointMissing={backendMissing}
      />
    </AppShell>
  );
}
