"use client";

import { useState } from "react";
import { createJoinRequest, searchTrips } from "../../lib/api";
import type { TripSearchResponse } from "../../lib/types";

interface TripSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TripSearchModal({ isOpen, onClose }: TripSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TripSearchResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [submittingTripId, setSubmittingTripId] = useState<number | null>(null);
  const [pendingTripIds, setPendingTripIds] = useState<Set<number>>(new Set());
  const [requestError, setRequestError] = useState<{ tripId: number; message: string } | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchError("");
    setSuccessMsg("");
    setRequestError(null);

    const term = query.trim();
    if (!term) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchTrips(term);
      setResults(data);
      setHasSearched(true);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Failed to search trips.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (tripId: number) => {
    setSubmittingTripId(tripId);
    setRequestError(null);
    setSuccessMsg("");

    try {
      await createJoinRequest(tripId);
      setPendingTripIds((prev) => new Set(prev).add(tripId));
      setSuccessMsg("Join request sent successfully. The trip admin will review your request.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      let userFriendlyMsg = "Something went wrong. Please try again.";

      if (message.toLowerCase().includes("owner")) {
        userFriendlyMsg = "You already own this trip.";
      } else if (message.toLowerCase().includes("already a member")) {
        userFriendlyMsg = "You are already a member of this trip.";
      } else if (message.toLowerCase().includes("pending request")) {
        userFriendlyMsg = "You already have a pending request for this trip.";
      } else if (message.toLowerCase().includes("401") || message.toLowerCase().includes("unauthorized")) {
        userFriendlyMsg = "Please log in to request to join a trip.";
      } else if (message.toLowerCase().includes("not found")) {
        userFriendlyMsg = "Trip not found.";
      }

      setRequestError({ tripId, message: userFriendlyMsg });
    } finally {
      setSubmittingTripId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
              <span>🔍</span> Find & Join Trips
            </h2>
            <p className="mt-1 text-sm text-slate-500">Search for trips by title and request to join</p>
          </div>
          <button onClick={onClose} className="text-xl font-bold text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              placeholder="Search by trip name (e.g. Goa, Paris)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </form>

          {/* Feedback Banners */}
          {successMsg && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
              {successMsg}
            </div>
          )}

          {searchError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              {searchError}
            </div>
          )}
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-500">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              Searching matching trips…
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center">
              <p className="text-sm font-semibold text-slate-500">No trips found matching "{query}".</p>
            </div>
          ) : (
            results.map((trip) => {
              const isSubmitting = submittingTripId === trip.id;
              const isPending = pendingTripIds.has(trip.id);
              const cardError = requestError?.tripId === trip.id ? requestError.message : null;

              return (
                <div
                  key={trip.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">{trip.title}</h3>
                    <p className="text-xs font-bold text-indigo-600">
                      📍 {trip.destinationName || "Destination"}{trip.country ? `, ${trip.country}` : ""}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>📅 {formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
                      <span>•</span>
                      <span>👑 Owner: {trip.ownerName || "Trip Admin"}</span>
                    </div>
                    {cardError && (
                      <p className="mt-2 text-xs font-semibold text-red-600">{cardError}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <button
                      disabled={isSubmitting || isPending}
                      onClick={() => handleJoinRequest(trip.id)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm ${
                        isPending
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed"
                          : isSubmitting
                          ? "bg-indigo-400 text-white cursor-wait"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {isSubmitting ? "Sending Request..." : isPending ? "Request Pending" : "Request to Join"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
