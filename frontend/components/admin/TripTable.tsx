"use client";

import type { TripAdminDTO } from "../../lib/types";
import TripStatusBadge from "./TripStatusBadge";

interface TripTableProps {
  trips: TripAdminDTO[];
  viewMode: "table" | "grid";
  onViewDetails: (trip: TripAdminDTO) => void;
  onCancelTrip: (trip: TripAdminDTO) => void;
  onDeleteTrip: (trip: TripAdminDTO) => void;
}

export default function TripTable({
  trips,
  viewMode,
  onViewDetails,
  onCancelTrip,
  onDeleteTrip,
}: TripTableProps) {
  if (trips.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        <span className="text-4xl">✈️</span>
        <h3 className="mt-3 text-base font-bold text-white">No Trips Found</h3>
        <p className="mt-1 text-xs text-slate-400">
          No matching trips fit your current search query or date/budget filters.
        </p>
      </div>
    );
  }

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

  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40"
          >
            {/* Header Image */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trip.destinationImageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"}
                alt={trip.destinationName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

              <div className="absolute top-3 left-3">
                <span className="rounded-lg bg-slate-950/80 border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-300 backdrop-blur-md">
                  Trip #{trip.id}
                </span>
              </div>

              <div className="absolute top-3 right-3">
                <TripStatusBadge status={trip.status} derivedStatus={trip.derivedStatus} />
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-base font-black text-white truncate">{trip.title}</h3>
                <p className="text-xs text-slate-300 font-medium">
                  📍 {trip.destinationName} ({trip.destinationCountry})
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col justify-between p-4 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">Traveler:</span>
                  <div className="text-right">
                    <span className="font-bold text-white block">{trip.userName || "Traveler"}</span>
                    <span className="text-[11px] text-slate-400">{trip.userEmail}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Dates:</span>
                  <span className="font-medium text-slate-200">
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Budget:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ${trip.budget ? trip.budget.toLocaleString() : "0"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => onViewDetails(trip)}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  View Details
                </button>
                {trip.derivedStatus !== "CANCELLED" && (
                  <button
                    onClick={() => onCancelTrip(trip)}
                    className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition-colors"
                    title="Cancel trip"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => onDeleteTrip(trip)}
                  className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors"
                  title="Delete trip"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* Table View */
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 uppercase text-[11px] font-bold tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Trip ID</th>
              <th className="px-4 py-3.5">Trip Title</th>
              <th className="px-4 py-3.5">Traveler</th>
              <th className="px-4 py-3.5">Destination</th>
              <th className="px-4 py-3.5">Travel Dates</th>
              <th className="px-4 py-3.5">Budget</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {trips.map((trip) => (
              <tr key={trip.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono font-bold text-slate-400">#{trip.id}</td>

                <td className="px-4 py-3">
                  <span className="font-bold text-white text-sm block">{trip.title}</span>
                  <span className="text-[10px] text-slate-400">
                    Created {formatDate(trip.createdAt)}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-200 block">{trip.userName || "Traveler"}</span>
                  <span className="text-[11px] text-slate-400">{trip.userEmail}</span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={trip.destinationImageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"}
                      alt={trip.destinationName}
                      className="h-8 w-8 rounded-lg object-cover border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34";
                      }}
                    />
                    <div>
                      <span className="font-bold text-slate-200 block">{trip.destinationName}</span>
                      <span className="text-[10px] text-slate-400">{trip.destinationCountry}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-300">
                  <span>{formatDate(trip.startDate)}</span>
                  <span className="text-slate-500"> → </span>
                  <span>{formatDate(trip.endDate)}</span>
                </td>

                <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                  ${trip.budget ? trip.budget.toLocaleString() : "0"}
                </td>

                <td className="px-4 py-3 text-center">
                  <TripStatusBadge status={trip.status} derivedStatus={trip.derivedStatus} />
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onViewDetails(trip)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:border-indigo-500 hover:text-white transition-colors"
                      title="View details"
                    >
                      👁️ Details
                    </button>

                    {trip.derivedStatus !== "CANCELLED" && (
                      <button
                        onClick={() => onCancelTrip(trip)}
                        className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-900/50 transition-colors"
                        title="Cancel trip"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTrip(trip)}
                      className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors"
                      title="Delete trip record"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
