"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { deleteTrip, getTrips } from "../../lib/api";
import type { Trip, TripStatus } from "../../lib/types";
import TripStatusBadge from "../../components/trips/TripStatusBadge";

export default function TripsPage() {
  return (
    <AppShell>
      <Suspense fallback={<TripsLoadingFallback />}>
        <TripsContent />
      </Suspense>
    </AppShell>
  );
}

function TripsContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | TripStatus>("ALL");

  useEffect(() => {
    if (statusParam === "ACTIVE" || statusParam === "PLANNED" || statusParam === "COMPLETED") {
      setSelectedFilter(statusParam);
    }
  }, [statusParam]);

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrips();
      setTrips(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setNotification(null);
    try {
      await deleteTrip(deleteTarget.id);
      setNotification({ type: "success", message: `Trip "${deleteTarget.title}" deleted successfully.` });
      setDeleteTarget(null);
      await loadTrips();
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete trip.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

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

  const plannedCount = useMemo(() => {
    return trips.filter((t) => resolveStatus(t) === "PLANNED").length;
  }, [trips]);

  const activeCount = useMemo(() => {
    return trips.filter((t) => resolveStatus(t) === "ACTIVE").length;
  }, [trips]);

  const completedCount = useMemo(() => {
    return trips.filter((t) => resolveStatus(t) === "COMPLETED").length;
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesStatus = selectedFilter === "ALL" || resolveStatus(trip) === selectedFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        trip.title.toLowerCase().includes(query) ||
        (trip.destination?.name && trip.destination.name.toLowerCase().includes(query)) ||
        (trip.destination?.country && trip.destination.country.toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [trips, selectedFilter, searchQuery]);

  const totalBudget = useMemo(() => {
    return trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);
  }, [trips]);

  return (
    <>
      {/* Hero Banner Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Journeys & Itineraries
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Trip History
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100/80 leading-relaxed">
              Explore your upcoming adventures, view active itineraries, and manage past travel memories in one unified workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadTrips}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white border border-white/15 backdrop-blur-md transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Syncing..." : "Refresh"}
            </button>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-extrabold text-indigo-900 shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-50 hover:shadow-xl active:scale-95"
            >
              <span>+</span> Create New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl border p-4 text-sm font-bold shadow-sm transition-all ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-900"
              : "border-red-200 bg-red-50/90 text-red-900"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">{notification.type === "success" ? "✅" : "⚠️"}</span>
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 rounded-lg px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider hover:bg-black/5"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Stats Cards - Filter directly on click */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trips"
          value={loading ? "…" : String(trips.length)}
          icon="🧳"
          color="indigo"
          active={selectedFilter === "ALL"}
          onClick={() => setSelectedFilter("ALL")}
        />
        <StatCard
          title="Active Now"
          value={loading ? "…" : String(activeCount)}
          icon="✈️"
          color="emerald"
          active={selectedFilter === "ACTIVE"}
          highlight={activeCount > 0}
          onClick={() => setSelectedFilter("ACTIVE")}
        />
        <StatCard
          title="Planned"
          value={loading ? "…" : String(plannedCount)}
          icon="📅"
          color="purple"
          active={selectedFilter === "PLANNED"}
          onClick={() => setSelectedFilter("PLANNED")}
        />
        <StatCard
          title="Completed"
          value={loading ? "…" : String(completedCount)}
          icon="🏁"
          color="teal"
          active={selectedFilter === "COMPLETED"}
          onClick={() => setSelectedFilter("COMPLETED")}
        />
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        {/* Filter & Search Bar */}
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1.5">
            <button
              onClick={() => setSelectedFilter("ALL")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedFilter === "ALL"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Trips ({trips.length})
            </button>
            <button
              onClick={() => setSelectedFilter("ACTIVE")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedFilter === "ACTIVE"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setSelectedFilter("PLANNED")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedFilter === "PLANNED"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Planned ({plannedCount})
            </button>
            <button
              onClick={() => setSelectedFilter("COMPLETED")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedFilter === "COMPLETED"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Box & Total Budget Badge */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-72">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trip title or location..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {!loading && trips.length > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2 text-xs font-extrabold text-indigo-900 shrink-0">
                <span className="text-indigo-600">💰</span> Total Budget: {formatBudget(totalBudget)}
              </div>
            )}
          </div>
        </div>

        {/* Trips Cards Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filteredTrips.length === 0 ? (
          <EmptyState searchQuery={searchQuery} filter={selectedFilter} onReset={() => { setSearchQuery(""); setSelectedFilter("ALL"); }} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDeleteClick={() => setDeleteTarget(trip)} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
                🗑️
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Trip</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Are you sure you want to permanently remove <span className="font-extrabold text-slate-900">"{deleteTarget.title}"</span> from your trips?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-200 transition hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Trip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TripCard({ trip, onDeleteClick }: { trip: Trip; onDeleteClick: () => void }) {
  const durationDays = useMemo(() => {
    if (!trip.startDate || !trip.endDate) return null;
    const start = new Date(`${trip.startDate}T00:00:00`).getTime();
    const end = new Date(`${trip.endDate}T00:00:00`).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : null;
  }, [trip.startDate, trip.endDate]);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-950/5">
      <div>
        {/* Cover Photo / Header Graphic */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          {trip.destination?.imageUrl ? (
            <img
              src={trip.destination.imageUrl}
              alt={trip.destination.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-5xl">
              🗺️
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3.5 right-3.5">
            <TripStatusBadge
              status={trip.status}
              startDate={trip.startDate}
              endDate={trip.endDate}
              variant="solid"
            />
          </div>

          {/* Duration Badge overlay if present */}
          {durationDays && (
            <div className="absolute bottom-3 left-3.5 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              ⏱️ {durationDays} {durationDays === 1 ? "Day" : "Days"}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5">
          <h3 className="line-clamp-1 text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors" title={trip.title}>
            {trip.title}
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            <span>📍</span>
            <span className="truncate">
              {trip.destination?.name
                ? `${trip.destination.name}${trip.destination.country ? `, ${trip.destination.country}` : ""}`
                : "Custom Location"}
            </span>
          </p>

          {/* Key Details Tags */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100/80 px-2.5 py-1.5 text-xs font-bold text-slate-700">
              <span>📅</span>
              <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-2.5 py-1.5 text-xs font-extrabold text-indigo-700">
              <span>💰</span>
              <span>{trip.budget == null ? "No budget" : formatBudget(Number(trip.budget))}</span>
            </div>
          </div>

          {/* Notes preview if present */}
          {trip.notes && (
            <p className="mt-3.5 line-clamp-2 text-xs leading-relaxed text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{trip.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Action Bar Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          View Details <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/trips/${trip.id}/edit`}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Edit
          </Link>
          <button
            onClick={onDeleteClick}
            className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  active = false,
  highlight = false,
  onClick,
}: {
  title: string;
  value: string;
  icon: string;
  color: "indigo" | "emerald" | "purple" | "teal";
  active?: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl border text-left bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg focus:outline-none ${
        active
          ? "ring-2 ring-indigo-600 border-indigo-300 bg-indigo-50/20"
          : highlight
          ? "ring-2 ring-emerald-500/20 border-emerald-200"
          : "border-slate-200/80"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl border transition-transform duration-300 group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        <strong className="text-3xl font-black text-slate-900 tracking-tight">{value}</strong>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 transition-colors">
          {title}
        </p>
        <span className={`text-xs font-extrabold transition-all duration-300 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1"}`}>
          {active ? "Filtered ✓" : "Filter →"}
        </span>
      </div>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-40 rounded-2xl bg-slate-200" />
          <div className="mt-4 h-6 w-3/4 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-1/2 rounded-lg bg-slate-100" />
          <div className="mt-4 flex gap-2">
            <div className="h-7 w-24 rounded-xl bg-slate-100" />
            <div className="h-7 w-24 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TripsLoadingFallback() {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p className="mt-4 text-xs font-bold text-slate-500">Loading trips page...</p>
    </div>
  );
}

function EmptyState({
  searchQuery,
  filter,
  onReset,
}: {
  searchQuery: string;
  filter: string;
  onReset: () => void;
}) {
  const isFiltered = searchQuery || filter !== "ALL";

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
        {isFiltered ? "🔍" : "🧳"}
      </div>
      <h3 className="mt-4 text-xl font-black text-slate-900">
        {isFiltered ? "No matching trips found" : "No trips planned yet"}
      </h3>
      <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
        {isFiltered
          ? "No trips matched your search or status filter criteria. Try adjusting your search query."
          : "Get started by planning your very first vacation, business trip, or weekend getaway."}
      </p>

      <div className="mt-6 flex items-center justify-center gap-3">
        {isFiltered ? (
          <button
            onClick={onReset}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Clear Filters
          </button>
        ) : (
          <Link
            href="/trips/new"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            + Create New Trip
          </Link>
        )}
      </div>
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
