"use client";

import type { TripAdminDTO } from "../../lib/types";

interface CancelTripDialogProps {
  isOpen: boolean;
  trip: TripAdminDTO | null;
  mode: "cancel" | "delete";
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelTripDialog({
  isOpen,
  trip,
  mode,
  loading,
  onClose,
  onConfirm,
}: CancelTripDialogProps) {
  if (!isOpen || !trip) return null;

  const isDelete = mode === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isDelete ? "🗑️" : "⚠️"}</span>
          <div>
            <h3 className="text-base font-bold text-white">
              {isDelete ? "Delete Trip Record" : "Cancel Traveler Trip"}
            </h3>
            <p className="text-[11px] text-slate-400">Trip #{trip.id} ({trip.title})</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {isDelete ? (
            <>
              Are you sure you want to permanently delete trip <strong className="text-white">#{trip.id}</strong> owned by <strong className="text-white">{trip.userName || trip.userEmail}</strong>? This action cannot be undone.
            </>
          ) : (
            <>
              Are you sure you want to change the status of trip <strong className="text-white">#{trip.id}</strong> to <strong className="text-rose-400">CANCELLED</strong>? The trip will be marked as cancelled across traveler views.
            </>
          )}
        </p>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400 space-y-1">
          <p>📍 <strong>Destination:</strong> {trip.destinationName} ({trip.destinationCountry})</p>
          <p>📅 <strong>Dates:</strong> {trip.startDate} to {trip.endDate}</p>
          <p>👤 <strong>Traveler:</strong> {trip.userName} ({trip.userEmail})</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition-colors disabled:opacity-50 ${
              isDelete
                ? "bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
                : "bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30"
            }`}
          >
            {loading ? "Processing…" : isDelete ? "Confirm Permanent Delete" : "Confirm Cancel Trip"}
          </button>
        </div>
      </div>
    </div>
  );
}
