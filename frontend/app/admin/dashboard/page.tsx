"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/AppShell";
import { getAdminAnalytics } from "../../../lib/api";
import type { AdminAnalyticsResponse } from "../../../lib/types";
import { Users, MapPin, Compass, DollarSign, TrendingUp, Calendar, RefreshCw, ChevronRight, ShieldCheck, Bell } from "lucide-react";

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load admin analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalUsers = analytics?.totalUsers ?? 0;
  const tripAnalytics = analytics?.tripAnalytics;
  const popularDestinations = analytics?.popularDestinations ?? [];
  const platformStats = analytics?.platformStats;
  const tripsOverTime = analytics?.tripsOverTime ?? [];

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300 border border-indigo-400/20">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              Administrator Workspace
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Platform Analytics Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-300 leading-relaxed">
              Real-time telemetry, user growth trends, trip lifecycle distribution, and platform metrics.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Analytics
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Users</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : totalUsers}</span>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500 border-t border-slate-100 pt-2.5">
            Registered Travelers & Admins
          </div>
        </div>

        {/* Total Trips */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Trips</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Compass className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{loading ? "..." : (tripAnalytics?.totalTrips ?? 0)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Upcoming: <strong className="text-emerald-600">{tripAnalytics?.upcomingTrips ?? 0}</strong></span>
            <span>Ongoing: <strong className="text-blue-600">{tripAnalytics?.ongoingTrips ?? 0}</strong></span>
          </div>
        </div>

        {/* Avg Trip Budget */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg Trip Budget</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{(tripAnalytics?.averageBudget ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-3 text-xs font-medium text-slate-500 border-t border-slate-100 pt-2.5">
            Average budget per created trip
          </div>
        </div>

        {/* Total Expenses Logged */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Platform Expenses</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">
              ₹{(platformStats?.totalExpenses ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-100 pt-2.5">
            <span>Notifications: <strong className="text-purple-600">{platformStats?.totalNotifications ?? 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Quick Admin Actions Row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/users"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">User Management</h3>
              <p className="text-xs text-slate-500">Roles, accounts & status</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/destinations"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Destination Catalog</h3>
              <p className="text-xs text-slate-500">Create & manage cities</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/trips"
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Global Trip Control</h3>
              <p className="text-xs text-slate-500">Monitor status & details</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Analytics Main Panels */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Monthly Trips Created */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Monthly Trip Creation Trend</h2>
              <p className="text-xs text-slate-500">Number of itineraries generated per month</p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-600" />
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : tripsOverTime.length > 0 ? (
            <div className="space-y-4">
              {tripsOverTime.map((trend, idx) => {
                const maxCount = Math.max(...tripsOverTime.map((t) => t.count), 1);
                const percent = Math.round((trend.count / maxCount) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{trend.month || `Month ${idx + 1}`}</span>
                      <span className="font-bold text-indigo-600">{trend.count} trips</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Calendar className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No monthly trip trend data available yet.</p>
            </div>
          )}
        </div>

        {/* Trip Lifecycle Distribution */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Trip Lifecycle Distribution</h2>
              <p className="text-xs text-slate-500">Current states of all registered trips</p>
            </div>
            <Compass className="h-5 w-5 text-emerald-600" />
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-5">
              {[
                { label: "Upcoming", count: tripAnalytics?.upcomingTrips ?? 0, color: "bg-emerald-500" },
                { label: "Ongoing", count: tripAnalytics?.ongoingTrips ?? 0, color: "bg-blue-500" },
                { label: "Completed", count: tripAnalytics?.completedTrips ?? 0, color: "bg-purple-500" },
                { label: "Cancelled", count: tripAnalytics?.cancelledTrips ?? 0, color: "bg-rose-500" },
              ].map((status, idx) => {
                const total = Math.max(tripAnalytics?.totalTrips ?? 1, 1);
                const pct = Math.round((status.count / total) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{status.label}</span>
                      <span className="font-bold text-slate-900">{status.count} ({pct}%)</span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${status.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Destinations Section */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Popular Destinations Analytics</h2>
            <p className="text-xs text-slate-500">Top traveled cities and trip associations</p>
          </div>
          <Link
            href="/admin/destinations"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Manage All Destinations →
          </Link>
        </div>

        {popularDestinations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularDestinations.map((dest, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 font-bold text-purple-700">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{dest.destinationName}</h4>
                    <p className="text-xs text-slate-500">Destination ID #{dest.destinationId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600">{dest.tripCount ?? 0} Trips</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-semibold text-slate-500">
            Destination telemetry will populate as travelers create trips to featured destinations.
          </div>
        )}
      </div>
    </AppShell>
  );
}
