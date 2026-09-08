"use client";

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
  backendEndpointMissing = false,
}: NotificationPanelProps) {
  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Notifications & Reminders</h2>
          <p className="mt-1 text-sm text-slate-500">
            Trip departure alerts, itinerary milestones, and system updates.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Checking…" : "🔄 Refresh"}
        </button>
      </div>

      {backendEndpointMissing && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-amber-900">
          <div className="flex items-start gap-3.5">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="text-sm font-bold">Backend Architecture Status</h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                The Spring Boot backend contains a <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-bold">Notification</code> entity, <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-bold">NotificationService</code>, and a 9:00 AM <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-bold">ReminderScheduler</code>. However, no <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-bold">NotificationController</code> (e.g. <code className="rounded bg-amber-100 px-1 py-0.5 font-mono font-bold">GET /api/notifications</code>) has been exposed on the REST API yet.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && !backendEndpointMissing && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="py-12 text-center text-sm font-semibold text-slate-400">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Checking notifications from backend…
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
            <span className="text-4xl">🔔</span>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">No New Notifications</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              You're all caught up! Automated reminders for upcoming trips and itinerary events will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">✈️</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{notif.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatTime(notif.createdAt)}</p>
                  </div>
                </div>
                {notif.eventKey && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
                    {notif.eventKey.split(":")[0]}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
