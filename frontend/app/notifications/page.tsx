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

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <AppShell>
      {/* Hero Banner Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Inbox & Reminders
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Notifications & Reminders
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100/80 leading-relaxed">
              Stay on schedule with real-time departure reminders, itinerary updates, and live weather forecast notifications.
            </p>
          </div>
        </div>
      </div>

      <NotificationPanel
        notifications={notifications}
        loading={loading}
        error={error}
        onRefresh={loadNotifications}
      />
    </AppShell>
  );
}
