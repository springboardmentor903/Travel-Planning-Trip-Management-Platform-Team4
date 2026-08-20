"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteTrip, getTrip } from "../../../lib/api";
import type { Trip } from "../../../lib/types";
import ItinerarySection from "../../../components/trips/ItinerarySection";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTrip = async () => {
    if (!params.id) return;
    setLoading(true);
    setError("");
    try {
      const data = await getTrip(params.id);
      setTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trip details from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [params.id]);

  const handleDelete = async () => {
    if (!trip) return;
    setIsDeleting(true);
    try {
      await deleteTrip(trip.id);
      router.push("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trip.");
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      {/* Navigation Breadcrumb */}
      <div className="mb-7 flex items-center justify-between">
        <Link
          href="/trips"
          className="inline-flex items-center text-sm font-bold text-indigo-600 transition hover:text-indigo-700"
        >
          ← Back to Trip History
        </Link>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          Loading trip details from backend…
        </div>
      ) : !trip ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ❓
          </div>
          <h3 className="mt-4 text-lg font-extrabold text-slate-900">Trip Not Found</h3>
          <p className="mt-1 text-sm text-slate-500">The trip you requested does not exist or you do not have permission to view it.</p>
          <Link href="/trips" className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
            Return to Trips
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Trip Card Component */}
          <TripOverviewCard
            trip={trip}
            onEdit={() => router.push(`/trips/${trip.id}/edit`)}
            onDelete={() => setDeleteModalOpen(true)}
          />

          {/* Full Day-by-Day Itinerary & Activity Section */}
          <ItinerarySection trip={trip} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && trip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Delete Trip</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{trip.title}"</span>? This will permanently remove the trip and all associated notes.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteModalOpen(false)}
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

function TripOverviewCard({
  trip,
  onEdit,
  onDelete,
}: {
  trip: Trip;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  const duration = calculateDurationDays(trip.startDate, trip.endDate);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Banner / Destination Image */}
      <div className="relative h-64 w-full bg-slate-800 sm:h-72">
        {trip.destination?.imageUrl ? (
          <img
            src={trip.destination.imageUrl}
            alt={trip.destination.name}
            className="h-full w-full object-cover opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-r from-indigo-700 to-violet-700 text-6xl">
            🗺️
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${
                status === "Active"
                  ? "bg-emerald-500 text-white"
                  : status === "Upcoming"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {status}
            </span>
            <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{trip.title}</h1>
            <p className="mt-1 text-lg font-bold text-indigo-200">
              📍 {trip.destination?.name}
              {trip.destination?.country ? `, ${trip.destination.country}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              ✏️ Edit Trip
            </button>
            <button
              onClick={onDelete}
              className="rounded-xl border border-red-300/30 bg-red-600/30 px-4 py-2.5 text-sm font-bold text-red-200 backdrop-blur-md transition hover:bg-red-600/50 hover:text-white"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Key Specifications */}
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
        <InfoCard label="Start Date" value={formatDate(trip.startDate)} icon="🛫" />
        <InfoCard label="End Date" value={formatDate(trip.endDate)} icon="🛬" />
        <InfoCard label="Duration" value={`${duration} Day${duration > 1 ? "s" : ""}`} icon="⏱️" />
        <InfoCard
          label="Budget"
          value={trip.budget == null ? "Not set" : formatBudget(Number(trip.budget))}
          icon="💳"
        />
      </div>

      {/* Destination Description & Notes Section */}
      <div className="border-t border-slate-100 p-6 sm:p-8">
        {trip.destination?.description && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">About Destination</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{trip.destination.description}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Notes & Reminders</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {trip.notes && trip.notes.trim() ? trip.notes : "No notes recorded for this trip."}
          </p>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-0.5 text-base font-extrabold text-slate-900">{value}</p>
        </div>
      </div>
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

function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
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
