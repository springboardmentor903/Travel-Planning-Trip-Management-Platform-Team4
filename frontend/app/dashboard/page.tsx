"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  const plannedTrips = trips.filter((t) => resolveStatus(t) === "PLANNED").length;
  const activeTrips = trips.filter((t) => resolveStatus(t) === "ACTIVE").length;
  const completedTrips = trips.filter((t) => resolveStatus(t) === "COMPLETED").length;

  return (
    <AppShell>
      {/* Welcome Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">Your travel workspace</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {user?.name ? `Welcome back, ${user.name}!` : "Welcome back!"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
          Track and organize your itineraries, manage travel budgets, and explore curated world destinations.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/trips/new"
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
          >
            + Plan a new trip
          </Link>
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20 transition disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "🔄 Refresh data"}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Trip Status Counts */}
      <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon="🧳"
          title="Total Trips"
          value={loading ? "…" : String(totalTrips)}
          subtext="All recorded journeys"
        />
        <SummaryCard
          icon="📅"
          title="Planned Trips"
          value={loading ? "…" : String(plannedTrips)}
          subtext="Upcoming departures"
          badge="PLANNED"
        />
        <SummaryCard
          icon="✈️"
          title="Active Trips"
          value={loading ? "…" : String(activeTrips)}
          subtext="Currently traveling"
          badge="ACTIVE"
        />
        <SummaryCard
          icon="✓"
          title="Completed Trips"
          value={loading ? "…" : String(completedTrips)}
          subtext="Past travel memories"
          badge="COMPLETED"
        />
      </section>

      {/* Main Grid: Destinations Catalog and Recent Trips */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Available Destinations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Available Destinations</h2>
              <p className="mt-1 text-sm text-slate-500">Curated locations from the TripNest database.</p>
            </div>
            <Link
              href="/destinations"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Browse All →
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : destinations.length === 0 ? (
            <EmptyState text="No destinations are available in the backend yet." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {destinations.slice(0, 6).map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.id}`}
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="mb-4 h-28 overflow-hidden rounded-xl bg-slate-100">
                    {destination.imageUrl ? (
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🌍</div>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{destination.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {destination.city || destination.country || "Location"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                    {destination.description || "Explore this destination."}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Trips */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recent Trips</h2>
              <p className="mt-1 text-sm text-slate-500">Your latest planned itineraries.</p>
            </div>
            <Link href="/trips" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View all →
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : trips.length === 0 ? (
            <EmptyState text="You have not created any trips yet. Click '+ Plan a new trip' to start." />
          ) : (
            <div className="space-y-3">
              {trips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{trip.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        📍 {trip.destination?.name || "Destination"}
                      </p>
                    </div>
                    <TripStatusBadge
                      status={trip.status}
                      startDate={trip.startDate}
                      endDate={trip.endDate}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    📅 {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  subtext,
  badge,
}: {
  icon: string;
  title: string;
  value: string;
  subtext: string;
  badge?: TripStatus;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </div>
        <span className="text-2xl font-extrabold text-slate-900">{value}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        {badge && <TripStatusBadge status={badge} />}
      </div>
      <p className="mt-1 text-xs text-slate-400">{subtext}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
      <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      Loading from backend…
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
      {text}
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
