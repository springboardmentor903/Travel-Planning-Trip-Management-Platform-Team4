"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDestinations, getTrips } from "../../lib/api";
import type { Destination, Trip, TripStatus, User } from "../../lib/types";
import TripStatusBadge from "../../components/trips/TripStatusBadge";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("user");
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(null);
          }
        }
      }

      const [destinationData, tripData] = await Promise.all([
        getDestinations(),
        getTrips(),
      ]);
      setDestinations(destinationData || []);
      setTrips(tripData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const resolveStatus = (trip: Trip): TripStatus => {
    if (trip.status === "ACTIVE" || trip.status === "PLANNED" || trip.status === "COMPLETED") {
      return trip.status;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(`${trip.startDate}T00:00:00`);
    const end = new Date(`${trip.endDate}T00:00:00`);
    if (end < today) return "COMPLETED";
    if (start <= today && end >= today) return "ACTIVE";
    return "PLANNED";
  };

  const totalTrips = trips.length;
  const plannedTrips = useMemo(() => trips.filter((t) => resolveStatus(t) === "PLANNED").length, [trips]);
  const activeTrips = useMemo(() => trips.filter((t) => resolveStatus(t) === "ACTIVE").length, [trips]);
  const completedTrips = useMemo(() => trips.filter((t) => resolveStatus(t) === "COMPLETED").length, [trips]);

  return (
    <AppShell>
      {/* Welcome Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-10 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Travel Workspace Overview
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              {user?.name ? `Welcome back, ${user.name}!` : "Welcome back!"}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100/80 leading-relaxed">
              Track your itineraries, explore world destinations, monitor budget allocations, and stay on top of upcoming travel departures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-900 shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-50 active:scale-95"
            >
              <span>+</span> Plan a New Trip
            </Link>
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white border border-white/15 backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Summary Stats Section - Clickable Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trips"
          value={loading ? "…" : String(totalTrips)}
          icon="🧳"
          subtext="All recorded journeys"
          color="indigo"
          href="/trips"
        />
        <StatCard
          title="Active Journeys"
          value={loading ? "…" : String(activeTrips)}
          icon="✈️"
          subtext="Currently traveling"
          color="emerald"
          highlight={activeTrips > 0}
          href="/trips?status=ACTIVE"
        />
        <StatCard
          title="Upcoming Planned"
          value={loading ? "…" : String(plannedTrips)}
          icon="📅"
          subtext="Upcoming departures"
          color="purple"
          href="/trips?status=PLANNED"
        />
        <StatCard
          title="Completed Trips"
          value={loading ? "…" : String(completedTrips)}
          icon="🏁"
          subtext="Past travel memories"
          color="teal"
          href="/trips?status=COMPLETED"
        />
      </div>

      {/* Main Grid: Destinations Showcase & Recent Trips */}
      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Curated Destinations */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">Featured Destinations</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                  {destinations.length} Places
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Explore handpicked world locations for your next trip.</p>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition"
            >
              Browse All Catalog <span>→</span>
            </Link>
          </div>

          {loading ? (
            <SkeletonDestinations />
          ) : destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-semibold text-slate-500">
              No destinations available.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.slice(0, 6).map((dest) => (
                <Link
                  key={dest.id}
                  href={`/destinations/${dest.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg"
                >
                  <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                    {dest.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-4xl">
                        🌍
                      </div>
                    )}
                    {dest.category && (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 shadow-sm">
                        {dest.category}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                      <span>📍</span>
                      <span className="truncate">{dest.city || dest.country || "Global Location"}</span>
                    </p>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {dest.description || "Discover points of interest and live weather forecast."}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-right">
                    <span className="text-[11px] font-extrabold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-block">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Trips Feed */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900">Recent Trips</h2>
                <p className="mt-1 text-xs text-slate-500">Your latest created itineraries.</p>
              </div>
              <Link href="/trips" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 transition">
                View All →
              </Link>
            </div>

            {loading ? (
              <SkeletonTrips />
            ) : trips.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <span className="text-3xl">🧳</span>
                <p className="mt-2 text-xs font-bold text-slate-700">No trips planned yet</p>
                <p className="mt-1 text-xs text-slate-400">Start organizing your next getaway now.</p>
                <Link
                  href="/trips/new"
                  className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  + Plan Trip
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {trips.slice(0, 4).map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group block rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {trip.title}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-indigo-600 flex items-center gap-1">
                          <span>📍</span>
                          <span className="truncate">{trip.destination?.name || "Custom Destination"}</span>
                        </p>
                      </div>
                      <TripStatusBadge
                        status={trip.status}
                        startDate={trip.startDate}
                        endDate={trip.endDate}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-[11px] font-semibold text-slate-500">
                      <span>📅 {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
                      {trip.budget && <span className="font-extrabold text-indigo-700">{formatBudget(Number(trip.budget))}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tip Footer Box */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-lg">
                💡
              </div>
              <div>
                <p className="text-xs font-black text-indigo-950">Trip Planning Tip</p>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  Add custom notes and daily budget targets to keep your travel spending on track.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  icon,
  subtext,
  color,
  highlight = false,
  href,
}: {
  title: string;
  value: string;
  icon: string;
  subtext: string;
  color: "indigo" | "emerald" | "purple" | "teal";
  highlight?: boolean;
  href: string;
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
  };

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl ${
        highlight ? "ring-2 ring-emerald-500/20 border-emerald-200" : "border-slate-200/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl border transition-transform duration-300 group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        <strong className="text-3xl font-black text-slate-900 tracking-tight">{value}</strong>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
            {title}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">{subtext}</p>
        </div>
        <span className="text-xs font-extrabold text-indigo-600 opacity-70 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
          View →
        </span>
      </div>
    </Link>
  );
}

function SkeletonDestinations() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 p-3">
          <div className="h-28 rounded-xl bg-slate-200" />
          <div className="mt-3 h-5 w-3/4 rounded-lg bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function SkeletonTrips() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 p-4">
          <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
          <div className="mt-2 h-3 w-1/2 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
