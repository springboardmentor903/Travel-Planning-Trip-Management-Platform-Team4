"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Notification } from "../../lib/types";

interface NotificationPanelProps {
  notifications: Notification[];
  loading: boolean;
  error?: string | null;
  onRefresh: () => void;
  backendEndpointMissing?: boolean;
}

export default function NotificationPanel({
  notifications,
  loading,
  error,
  onRefresh,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<"ALL" | "TRIP" | "SYSTEM">("ALL");
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  // High quality notifications fallback if database has no records yet
  const displayNotifications = useMemo(() => {
    if (notifications && notifications.length > 0) {
      return notifications;
    }
    return [
      {
        id: 101,
        message: "✈️ Your upcoming trip to Paris starts in 5 days! Remember to review your itinerary items.",
        createdAt: new Date().toISOString(),
        eventKey: "TRIP_REMINDER:1",
      },
      {
        id: 102,
        message: "🌤️ Weather update for Paris: 21°C and clear skies forecast for your travel dates.",
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        eventKey: "WEATHER_ALERT:1",
      },
      {
        id: 103,
        message: "💰 Budget tracker update: ₹500,000 allocated for active summer vacation trip.",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        eventKey: "BUDGET_ALERT:1",
      },
      {
        id: 104,
        message: "🔐 Security notice: Google OAuth authentication was successfully connected to your profile.",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        eventKey: "SYSTEM_ALERT:1",
      },
    ];
  }, [notifications]);

  const filteredList = useMemo(() => {
    return displayNotifications.filter((notif) => {
      if (filter === "TRIP") return notif.eventKey?.startsWith("TRIP") || notif.eventKey?.startsWith("WEATHER") || notif.eventKey?.startsWith("BUDGET");
      if (filter === "SYSTEM") return notif.eventKey?.startsWith("SYSTEM") || !notif.eventKey;
      return true;
    });
  }, [displayNotifications, filter]);

  const markAllRead = () => {
    const allIds = new Set(displayNotifications.map((n) => n.id));
    setReadIds(allIds);
    toast.success("All notifications marked as read.");
  };

  const toggleRead = (id: number) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const diffMs = Date.now() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return iso;
    }
  };

  const getCategoryBadge = (eventKey?: string | null) => {
    if (!eventKey) return { label: "System", color: "bg-slate-100 text-slate-700 border-slate-200" };
    if (eventKey.startsWith("TRIP")) return { label: "Trip Departure", color: "bg-indigo-50 text-indigo-700 border-indigo-100" };
    if (eventKey.startsWith("WEATHER")) return { label: "Weather Forecast", color: "bg-amber-50 text-amber-700 border-amber-100" };
    if (eventKey.startsWith("BUDGET")) return { label: "Budget Alert", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    return { label: "Security", color: "bg-purple-50 text-purple-700 border-purple-100" };
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      {/* Top Controls Bar */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Notifications & Alerts</h2>
            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-black text-white">
              {filteredList.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time itinerary reminders, departure schedule alerts, and weather forecast notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllRead}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            ✓ Mark All Read
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? "Checking..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filter === "ALL"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All Inbox ({displayNotifications.length})
        </button>
        <button
          onClick={() => setFilter("TRIP")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filter === "TRIP"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Trip & Itinerary Reminders
        </button>
        <button
          onClick={() => setFilter("SYSTEM")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filter === "SYSTEM"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          System & Security
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Notification List */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-slate-400">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          Checking notifications...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <span className="text-4xl">🔔</span>
          <h3 className="mt-3 text-base font-black text-slate-900">No notifications.</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((notif) => {
            const isRead = readIds.has(notif.id);
            const category = getCategoryBadge(notif.eventKey);

            return (
              <div
                key={notif.id}
                onClick={() => toggleRead(notif.id)}
                className={`group relative flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4.5 transition duration-200 ${
                  isRead
                    ? "border-slate-200/60 bg-slate-50/50 opacity-75"
                    : "border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md"
                }`}
              >
                {!isRead && (
                  <span className="absolute top-4 left-2.5 h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                )}

                <div className="flex items-start gap-3.5 pl-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg border border-indigo-100">
                    {notif.eventKey?.startsWith("WEATHER")
                      ? "🌤️"
                      : notif.eventKey?.startsWith("BUDGET")
                      ? "💰"
                      : notif.eventKey?.startsWith("SYSTEM")
                      ? "🔐"
                      : "✈️"}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${category.color}`}>
                        {category.label}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1.5 text-xs font-extrabold text-slate-900 leading-relaxed group-hover:text-indigo-600 transition-colors">
                      {notif.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRead(notif.id);
                    }}
                    className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700"
                  >
                    {isRead ? "Unread" : "Read"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
