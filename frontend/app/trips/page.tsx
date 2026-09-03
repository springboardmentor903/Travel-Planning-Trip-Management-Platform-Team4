"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteTrip, getDestinations, getTrips } from "../../lib/api";
import type { Destination, Trip } from "../../lib/types";
import TripSearchModal from "../../components/trips/TripSearchModal";


export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Search and Filter Tab state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Upcoming" | "Completed">("All");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tripsData, destsData] = await Promise.all([
        getTrips(),
        getDestinations().catch(() => []),
      ]);
      setTrips(tripsData);
      setDestinations(destsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setNotification(null);
    try {
      await deleteTrip(deleteTarget.id);
      setNotification({ type: "success", message: `Trip "${deleteTarget.title}" deleted successfully.` });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete trip.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const completedCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trips.filter((trip) => new Date(`${trip.endDate}T00:00:00`) < today).length;
  }, [trips]);

  const activeCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trips.filter((trip) => {
      const start = new Date(`${trip.startDate}T00:00:00`);
      const end = new Date(`${trip.endDate}T00:00:00`);
      return start <= today && end >= today;
    }).length;
  }, [trips]);

  const upcomingCount = trips.length - completedCount - activeCount;
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);

  // Filtered trips evaluation
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination?.country?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      const status = getTripStatus(trip.startDate, trip.endDate);
      if (activeTab === "All") return true;
      return status === activeTab;
    });
  }, [trips, searchQuery, activeTab]);

  return (
    <AppShell>
      {/* Top Header & Core Actions */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-extrabold text-indigo-700">
              Trip History
            </span>
            <span className="text-xs font-bold text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Plan better. Travel smarter.</span>
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            My Travel Workspace
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            onClick={() => setSearchModalOpen(true)}
            className="rounded-2xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100/80"
          >
            🔍 Find & Join Trip
          </button>
          <Link
            href="/trips/new"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-200 transition duration-200 hover:opacity-95 hover:shadow-lg"
          >
            <span>+</span> Create New Trip
          </Link>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`mb-6 flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-[10px] font-extrabold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 sm:flex-row sm:items-center">
          <span>Unable to load your trips.</span>
          <button
            onClick={loadData}
            className="rounded-xl border border-red-300 bg-white px-3.5 py-1.5 text-xs font-extrabold text-red-700 shadow-xs hover:bg-red-100"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Travel Overview Statistics Cards */}
      <section className="mb-9">
        <h2 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Your Travel Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Total Trips"
            value={loading ? "…" : String(trips.length)}
            subtitle="Trips planned"
            icon="🧳"
            color="indigo"
          />
          <Stat
            title="Active Now"
            value={loading ? "…" : String(activeCount)}
            subtitle="Currently travelling"
            icon="✈️"
            color="emerald"
          />
          <Stat
            title="Upcoming"
            value={loading ? "…" : String(upcomingCount)}
            subtitle="Trips coming soon"
            icon="📅"
            color="violet"
          />
          <Stat
            title="Completed"
            value={loading ? "…" : String(completedCount)}
            subtitle="Trips completed"
            icon="✓"
            color="slate"
          />
        </div>
      </section>

      {/* Featured Destinations Section */}
      {destinations.length > 0 && (
        <section className="mb-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                <span>🌟</span> Featured Destinations
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">Discover popular places for your next journey</p>
            </div>
            <Link
              href="/destinations"
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700"
            >
              Explore All →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.slice(0, 4).map((dest) => (
              <div
                key={dest.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50 transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-32 w-full bg-slate-200">
                  {dest.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-3xl">
                      🗺️
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-sm font-extrabold text-white">
                    {dest.name}
                  </span>
                  {dest.category && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 backdrop-blur-xs">
                      {dest.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3">
                  <span className="text-xs font-semibold text-slate-500">
                    📍 {dest.country || "Global"}
                  </span>
                  <Link
                    href={`/trips/new?destinationId=${dest.id}`}
                    className="rounded-xl bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
                  >
                    + Plan Trip
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Trips Section with Filter Tabs & Search */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">My Trips</h2>
            <p className="mt-0.5 text-xs text-slate-500">View, search, and manage your travel itineraries</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Real-time search bar */}
            <div className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search trip or destination…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3.5 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1">
              {(["All", "Active", "Upcoming", "Completed"] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : filteredTrips.length === 0 ? (
          <EmptyState isFiltered={searchQuery !== "" || activeTab !== "All"} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDeleteClick={() => setDeleteTarget(trip)} />
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Delete Trip</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Search & Join Modal */}
      <TripSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </AppShell>
  );
}

function TripCard({ trip, onDeleteClick }: { trip: Trip; onDeleteClick: () => void }) {
  const status = getTripStatus(trip.startDate, trip.endDate);

  return (
    <article className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl">
      <div>
        {/* Cover image header */}
        <div className="relative mb-4 h-40 overflow-hidden rounded-2xl bg-slate-100">
          {trip.destination?.imageUrl ? (
            <img
              src={trip.destination.imageUrl}
              alt={trip.destination.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-4xl text-white">
              🗺️
            </div>
          )}
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-extrabold shadow-sm ${
              status === "Active"
                ? "bg-emerald-500 text-white"
                : status === "Upcoming"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            {status}
          </span>
        </div>

        {/* Title & Location */}
        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition" title={trip.title}>
          {trip.title}
        </h3>
        <p className="mt-1 text-xs font-bold text-indigo-600">
          📍 {trip.destination?.name ? `${trip.destination.name}${trip.destination.country ? `, ${trip.destination.country}` : ""}` : "Destination Unset"}
        </p>

        {/* Date and Budget Pill Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
            📅 {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
          <span className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1">
            💰 {trip.budget == null ? "No budget set" : formatBudget(Number(trip.budget))}
          </span>
        </div>

        {/* Notes preview */}
        {trip.notes && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {trip.notes}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <Link
          href={`/trips/${trip.id}`}
          className="rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
        >
          View Details
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/trips/${trip.id}/edit`}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Edit
          </Link>
          <button
            onClick={onDeleteClick}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  color: "indigo" | "emerald" | "violet" | "slate";
}) {
  const iconBg =
    color === "indigo"
      ? "bg-indigo-50 text-indigo-600 border-indigo-100"
      : color === "emerald"
      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
      : color === "violet"
      ? "bg-violet-50 text-violet-600 border-violet-100"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${iconBg} text-lg font-bold`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <strong className="text-3xl font-extrabold text-slate-900">{value}</strong>
        <p className="mt-0.5 text-xs font-medium text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="mb-4 h-40 rounded-2xl bg-slate-200/80" />
          <div className="mb-2 h-5 w-3/4 rounded-lg bg-slate-200/80" />
          <div className="mb-4 h-4 w-1/2 rounded-lg bg-slate-200/70" />
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-28 rounded-xl bg-slate-200/60" />
            <div className="h-6 w-24 rounded-xl bg-slate-200/60" />
          </div>
          <div className="mt-4 h-10 rounded-xl bg-slate-200/50" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
        🧳
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-slate-900">
        {isFiltered ? "No matching trips found" : "No trips planned yet"}
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        {isFiltered
          ? "Try adjusting your search query or filter tab."
          : "Start by planning your first trip destination and itinerary dates."}
      </p>
      {!isFiltered && (
        <Link
          href="/trips/new"
          className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
        >
          + Create New Trip
        </Link>
      )}
    </div>
  );
}

function getTripStatus(startDateStr: string, endDateStr: string): "Upcoming" | "Active" | "Completed" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);

  if (end < today) return "Completed";
  if (start <= today && end >= today) return "Active";
  return "Upcoming";
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




