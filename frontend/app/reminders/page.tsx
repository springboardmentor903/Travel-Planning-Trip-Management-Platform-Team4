"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/AppShell";
import {
  getActivities,
  getItineraries,
  getRemainingBudget,
  getTrips,
} from "../../lib/api";
import type { Activity, ItineraryDay, ReminderNotification, Trip } from "../../lib/types";

function dateKey(value: Date | string) {
  const d = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tomorrowKey() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return dateKey(d);
}

function activityDate(activity: Activity) {
  if (!activity.startTime) return null;
  const value = activity.startTime;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return null;
}

export default function RemindersPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [itineraries, setItineraries] = useState<Record<number, ItineraryDay[]>>({});
  const [activities, setActivities] = useState<Record<number, Activity[]>>({});
  const [budgetUsage, setBudgetUsage] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const tripData = await getTrips();
      setTrips(tripData);

      const itineraryEntries = await Promise.all(
        tripData.map(async (trip) => [trip.id, await getItineraries(trip.id)] as const)
      );
      const itineraryMap = Object.fromEntries(itineraryEntries) as Record<number, ItineraryDay[]>;
      setItineraries(itineraryMap);

      const activityEntries = await Promise.all(
        Object.values(itineraryMap).flat().map(async (day) => [day.id, await getActivities(day.id)] as const)
      );
      setActivities(Object.fromEntries(activityEntries) as Record<number, Activity[]>);

      const budgetEntries = await Promise.all(
        tripData.map(async (trip) => {
          try {
            const budget = await getRemainingBudget(trip.id);
            const total = Number(budget.totalBudget || 0);
            const spent = Number(budget.totalExpenses || 0);
            return [trip.id, total > 0 ? (spent / total) * 100 : 0] as const;
          } catch {
            return [trip.id, 0] as const;
          }
        })
      );
      setBudgetUsage(Object.fromEntries(budgetEntries));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load reminders and alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const notifications = useMemo<ReminderNotification[]>(() => {
    const result: ReminderNotification[] = [];
    const tomorrow = tomorrowKey();

    trips.forEach((trip) => {
      if (trip.startDate === tomorrow) {
        result.push({
          id: `trip-${trip.id}-${tomorrow}`,
          type: "TRIP",
          title: "Trip reminder",
          message: `Your trip "${trip.title}" starts tomorrow.`,
          tripId: trip.id,
          tripTitle: trip.title,
          scheduledFor: tomorrow,
          severity: "info",
        });
      }

      const usage = budgetUsage[trip.id] || 0;
      if (usage >= 100) {
        result.push({
          id: `budget-100-${trip.id}`,
          type: "BUDGET_100",
          title: "Budget limit reached",
          message: `"${trip.title}" has reached ${usage.toFixed(0)}% of its budget.`,
          tripId: trip.id,
          tripTitle: trip.title,
          severity: "critical",
        });
      } else if (usage >= 80) {
        result.push({
          id: `budget-80-${trip.id}`,
          type: "BUDGET_80",
          title: "Budget warning",
          message: `"${trip.title}" has reached ${usage.toFixed(0)}% of its budget.`,
          tripId: trip.id,
          tripTitle: trip.title,
          severity: "warning",
        });
      }
    });

    Object.entries(itineraries).forEach(([tripIdText, days]) => {
      const tripId = Number(tripIdText);
      const trip = trips.find((item) => item.id === tripId);
      days.forEach((day) => {
        (activities[day.id] || []).forEach((activity) => {
          const startDate = activityDate(activity);
          if (startDate === tomorrow) {
            result.push({
              id: `activity-${activity.id}-${tomorrow}`,
              type: "ACTIVITY",
              title: "Activity reminder",
              message: `"${activity.name}" in ${trip?.title || "your trip"} starts tomorrow.`,
              tripId,
              tripTitle: trip?.title,
              scheduledFor: tomorrow,
              severity: "info",
            });
          }
        });
      });
    });

    return result.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
  }, [trips, itineraries, activities, budgetUsage]);

  return (
    <AppShell>
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-purple-600 p-7 text-white shadow-xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">Notifications & alerts</p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Stay ahead of your trip</h1>
        <p className="mt-3 max-w-2xl text-indigo-100">Trip and activity reminders for tomorrow, plus automatic budget warnings at 80% and 100%.</p>
      </section>

      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="mt-7 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">Alert center</h2>
          <p className="mt-1 text-sm text-slate-500">Based on your current trips, activities and expense data.</p>
        </div>
        <button onClick={load} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">↻ Refresh</button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-semibold text-slate-500">Loading notifications…</div>
      ) : notifications.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-4xl">🔔</div>
          <h3 className="mt-3 text-lg font-extrabold">You are all caught up</h3>
          <p className="mt-1 text-sm text-slate-500">No trip/activity reminders for tomorrow and no budget thresholds currently crossed.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)}
        </div>
      )}
    </AppShell>
  );
}

function severityOrder(severity: ReminderNotification["severity"]) {
  return severity === "critical" ? 0 : severity === "warning" ? 1 : 2;
}

function NotificationCard({ notification }: { notification: ReminderNotification }) {
  const styles = notification.severity === "critical"
    ? "border-red-200 bg-red-50"
    : notification.severity === "warning"
      ? "border-amber-200 bg-amber-50"
      : "border-blue-200 bg-blue-50";
  const icon = notification.type === "TRIP" ? "✈️" : notification.type === "ACTIVITY" ? "📅" : notification.severity === "critical" ? "🚨" : "⚠️";

  return <article className={`rounded-2xl border p-5 shadow-sm ${styles}`}>
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold text-slate-900">{notification.title}</h3>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">{notification.type.replace("_", " ")}</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{notification.message}</p>
      </div>
    </div>
  </article>;
}
