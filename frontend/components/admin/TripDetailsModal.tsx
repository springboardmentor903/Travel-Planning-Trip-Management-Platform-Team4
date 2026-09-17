"use client";

import { useEffect, useState } from "react";
import type { TripAdminDetailsDTO } from "../../lib/types";
import { getAdminTripDetails } from "../../lib/api";
import TripStatusBadge from "./TripStatusBadge";

interface TripDetailsModalProps {
  isOpen: boolean;
  tripId: number | null;
  onClose: () => void;
}

export default function TripDetailsModal({ isOpen, tripId, onClose }: TripDetailsModalProps) {
  const [details, setDetails] = useState<TripAdminDetailsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !tripId) return;

    setLoading(true);
    setError(null);
    getAdminTripDetails(tripId)
      .then((data) => setDetails(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load trip details."))
      .finally(() => setLoading(false));
  }, [isOpen, tripId]);

  if (!isOpen || !tripId) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getDurationDays = (start?: string, end?: string) => {
    if (!start || !end) return null;
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffMs = e.getTime() - s.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
      return days > 0 ? days : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Trip Overview #{tripId}
            </span>
            <h2 className="text-lg font-black text-white">{details?.title || "Trip Details"}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
                <p className="mt-2 text-xs font-semibold text-slate-400">Loading trip details…</p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
              ⚠️ {error}
            </div>
          ) : details ? (
            <>
              {/* Status Header */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center gap-3">
                  <TripStatusBadge status={details.status} derivedStatus={details.derivedStatus} />
                  <span className="text-xs text-slate-400 font-medium">
                    Created on {formatDate(details.createdAt)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Budget</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ${details.budget ? details.budget.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* Grid Section: Traveler & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Traveler Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    👤 Traveler Profile
                  </h3>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white text-sm">{details.userName || "N/A"}</p>
                    <p className="text-slate-400">{details.userEmail}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="rounded bg-indigo-950 border border-indigo-700/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                        {details.userRole || "TRAVELER"}
                      </span>
                      {details.userOauthGoogle && (
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          Google OAuth
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Destination Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    🏝️ Destination Info
                  </h3>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white text-sm">
                      {details.destination?.name || "N/A"}
                    </p>
                    <p className="text-slate-400">
                      📍 {details.destination?.city ? `${details.destination.city}, ` : ""}
                      {details.destination?.country}
                    </p>
                    {details.destination?.category && (
                      <span className="inline-block mt-2 rounded bg-indigo-950 border border-indigo-700/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                        {details.destination.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Travel Dates & Duration */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  📅 Itinerary Schedule
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-slate-900 p-2.5">
                    <span className="text-[10px] text-slate-400 block">Start Date</span>
                    <span className="font-bold text-white">{formatDate(details.startDate)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2.5">
                    <span className="text-[10px] text-slate-400 block">End Date</span>
                    <span className="font-bold text-white">{formatDate(details.endDate)}</span>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2.5">
                    <span className="text-[10px] text-slate-400 block">Duration</span>
                    <span className="font-bold text-indigo-300">
                      {getDurationDays(details.startDate, details.endDate)
                        ? `${getDurationDays(details.startDate, details.endDate)} Days`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Traveler Notes */}
              {details.notes && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    📝 Traveler Notes
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed italic">{details.notes}</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 px-6 py-3 bg-slate-950/40">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
