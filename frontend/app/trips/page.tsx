"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteTrip, getTrips } from "../../lib/api";
import type { Trip } from "../../lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips from backend.");
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

  const completedCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trips.filter((trip) => new Date(trip.endDate) < today).length;
  }, [trips]);

  const activeCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return trips.filter((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return start <= today && end >= today;
    }).length;
  }, [trips]);

  const upcomingCount = trips.length - completedCount - activeCount;
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);

  return (
    <AppShell>
      {/* Header Section */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold text-indigo-600">Your Journeys</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Trip History</h1>
          <p className="mt-2 text-sm text-slate-500">Manage and explore all your planned trips.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTrips}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Refresh
          </button>
          <Link
            href="/trips/new"
            className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            + Create New Trip
          </Link>
        </div>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-sm font-semibold ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        <Stat title="Total Trips" value={loading ? "…" : String(trips.length)} icon="🧳" />
        <Stat title="Active Now" value={loading ? "…" : String(activeCount)} icon="✈️" />
        <Stat title="Upcoming" value={loading ? "…" : String(upcomingCount)} icon="📅" />
        <Stat title="Completed" value={loading ? "…" : String(completedCount)} icon="✓" />
      </div>

      {/* Trip List Container */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">All Trips</h2>
            <p className="mt-1 text-sm text-slate-500">Loaded via GET /api/trips</p>
          </div>
          {!loading && trips.length > 0 && (
            <div className="rounded-xl bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700">
              Total Budget: {formatBudget(totalBudget)}
            </div>
          )}
        </div>

        {loading ? (
          <LoadingState />
        ) : trips.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDeleteClick={() => setDeleteTarget(trip)} />
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Delete Trip</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function TripCard({ trip, onDeleteClick }: { trip: Trip; onDeleteClick: () => void }) {
  const status = getTripStatus(trip.startDate, trip.endDate);

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
      <div>
        {/* Destination Image or Fallback Header */}
        <div className="relative mb-4 h-36 overflow-hidden rounded-xl bg-slate-100">
          {trip.destination?.imageUrl ? (
            <img
              src={trip.destination.imageUrl}
              alt={trip.destination.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-4xl">
              🗺️
            </div>
          )}
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${
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

        {/* Card Header Info */}
        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900" title={trip.title}>
          {trip.title}
        </h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
          📍 {trip.destination?.name ? `${trip.destination.name}${trip.destination.country ? `, ${trip.destination.country}` : ""}` : "Destination Unavailable"}
        </p>

        {/* Date and Budget Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1">
            📅 {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1">
            💰 {trip.budget == null ? "No budget set" : formatBudget(Number(trip.budget))}
          </span>
        </div>

        {/* Notes preview if available */}
        {trip.notes && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
            {trip.notes}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <Link
          href={`/trips/${trip.id}`}
          className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          View Details
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/trips/${trip.id}/edit`}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Edit
          </Link>
          <button
            onClick={onDeleteClick}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
          {icon}
        </div>
        <strong className="text-2xl font-extrabold text-slate-900">{value}</strong>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-500">{title}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-xl bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      Loading trips from backend…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
        🧳
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-slate-900">No trips planned yet</h3>
      <p className="mt-1 text-sm text-slate-500">
        Start by planning your first trip destination and itinerary dates.
      </p>
      <Link
        href="/trips/new"
        className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
      >
        + Create New Trip
      </Link>
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
