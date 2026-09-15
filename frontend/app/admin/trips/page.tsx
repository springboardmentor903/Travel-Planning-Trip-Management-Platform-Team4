"use client";

import { useEffect, useState } from "react";
import AppShell from "../../../components/AppShell";
import {
  getPaginatedAdminTrips,
  updateAdminTripStatus,
  deleteAdminTrip,
  getAdminTripDetails,
} from "../../../lib/api";
import type { TripAdminDTO, TripAdminDetailsDTO } from "../../../lib/types";
import { Compass, Search, Eye, Trash2, RefreshCw, ChevronLeft, ChevronRight, Calendar, DollarSign, AlertTriangle, X } from "lucide-react";

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<TripAdminDTO[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Selected Trip for Details Modal
  const [selectedTrip, setSelectedTrip] = useState<TripAdminDetailsDTO | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Selected Trip for Delete Modal
  const [tripToDelete, setTripToDelete] = useState<TripAdminDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaginatedAdminTrips({
        page,
        size: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setTrips(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch platform trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [page, search, statusFilter]);

  const handleStatusChange = async (tripId: number, newStatus: string) => {
    try {
      await updateAdminTripStatus(tripId, newStatus);
      setActionSuccess(`Trip #${tripId} status updated to ${newStatus}.`);
      loadTrips();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update trip status.");
    }
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    setDeleting(true);
    try {
      const res = await deleteAdminTrip(tripToDelete.id);
      setActionSuccess(res.message || "Trip deleted successfully.");
      setTripToDelete(null);
      loadTrips();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete trip.");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewDetails = async (tripId: number) => {
    setLoadingDetails(true);
    setSelectedTrip(null);
    try {
      const details = await getAdminTripDetails(tripId);
      setSelectedTrip(details);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load trip details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md border border-white/10">
              <Compass className="h-3.5 w-3.5 text-emerald-300" />
              Global Trip Oversight
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Platform Trip Management
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-300 leading-relaxed">
              Monitor user itineraries, update trip lifecycle statuses, inspect budget allocations, and manage trips.
            </p>
          </div>

          <button
            onClick={loadTrips}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Trips
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          ✅ {actionSuccess}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search trips by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Trip Title</th>
                <th className="px-6 py-4">Organizer</th>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Dates & Budget</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">Loading trips list…</p>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs font-semibold text-slate-500">
                    No trips found matching selected filters.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{trip.title}</p>
                        <p className="text-xs text-slate-500">Trip #{trip.id}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-slate-800">{trip.userName || "Organizer"}</p>
                      <p className="text-slate-500">{trip.userEmail}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        {trip.destinationName || "Destination"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{trip.startDate ? new Date(trip.startDate).toLocaleDateString() : "—"}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 font-bold text-slate-900">
                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                        <span>₹{(trip.budget || 0).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={trip.status || "PLANNED"}
                        onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm focus:border-indigo-600 focus:outline-none"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(trip.id)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setTripToDelete(trip)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
          <span className="text-xs font-medium text-slate-500">
            Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} trips)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">Trip Overview & Details</h3>
              <button
                onClick={() => setSelectedTrip(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  {selectedTrip.status}
                </span>
                <h4 className="mt-1 text-xl font-black text-slate-900">{selectedTrip.title}</h4>
                <p className="text-xs text-slate-500">Destination: {selectedTrip.destination?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Organizer</span>
                  <p className="font-bold text-slate-900">{selectedTrip.userName}</p>
                  <p className="text-[11px] text-slate-500">{selectedTrip.userEmail}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Budget</span>
                  <p className="font-bold text-slate-900">₹{(selectedTrip.budget || 0).toLocaleString()}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">Start Date</span>
                  <p className="font-bold text-slate-900">{selectedTrip.startDate || "—"}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500 font-medium">End Date</span>
                  <p className="font-bold text-slate-900">{selectedTrip.endDate || "—"}</p>
                </div>
              </div>

              {selectedTrip.notes && (
                <div className="rounded-xl bg-slate-50 p-3 text-xs">
                  <span className="text-slate-500 font-medium">Trip Notes</span>
                  <p className="mt-1 text-slate-800 font-medium leading-relaxed">{selectedTrip.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-right">
              <button
                onClick={() => setSelectedTrip(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Trip Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Trip #{tripToDelete.id}?</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Are you sure you want to permanently delete <strong>"{tripToDelete.title}"</strong>? This will remove all associated itineraries and expenses.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 justify-end">
              <button
                onClick={() => setTripToDelete(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTrip}
                disabled={deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
