"use client";

import { useEffect, useState } from "react";
import AppShell from "../../../components/AppShell";
import {
  getPaginatedAdminDestinations,
  getAdminDestinationStats,
  createAdminDestination,
  updateAdminDestination,
  updateAdminDestinationStatus,
  deleteAdminDestination,
} from "../../../lib/api";
import type { DestinationAdminDTO, DestinationStatsResponse, CreateDestinationRequest } from "../../../lib/types";
import { MapPin, Search, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react";

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationAdminDTO[]>([]);
  const [stats, setStats] = useState<DestinationStatsResponse | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<DestinationAdminDTO | null>(null);
  const [destToDelete, setDestToDelete] = useState<DestinationAdminDTO | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("Metropolitan");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [saving, setSaving] = useState(false);

  const loadStats = async () => {
    try {
      const data = await getAdminDestinationStats();
      setStats(data);
    } catch {
      // Ignore
    }
  };

  const loadDestinations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaginatedAdminDestinations({
        page,
        size: 10,
        search: search.trim() || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setDestinations(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch destinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [page, search, categoryFilter, statusFilter]);

  const resetForm = () => {
    setName("");
    setCountry("");
    setCity("");
    setCategory("Metropolitan");
    setImageUrl("");
    setDescription("");
    setLatitude(0);
    setLongitude(0);
    setEditingDestination(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (dest: DestinationAdminDTO) => {
    setEditingDestination(dest);
    setName(dest.name);
    setCountry(dest.country);
    setCity(dest.city || "");
    setCategory(dest.category || "Metropolitan");
    setImageUrl(dest.imageUrl || "");
    setDescription(dest.description || "");
    setLatitude(dest.latitude || 0);
    setLongitude(dest.longitude || 0);
    setIsCreateModalOpen(true);
  };

  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload: CreateDestinationRequest = {
      name,
      country,
      city,
      category,
      imageUrl,
      description,
      latitude,
      longitude,
    };

    try {
      if (editingDestination) {
        await updateAdminDestination(editingDestination.id, payload);
        setActionSuccess(`Destination "${name}" updated successfully.`);
      } else {
        await createAdminDestination(payload);
        setActionSuccess(`New destination "${name}" added to catalog.`);
      }
      setIsCreateModalOpen(false);
      resetForm();
      loadDestinations();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save destination.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (dest: DestinationAdminDTO) => {
    const nextStatus = !dest.active;
    try {
      await updateAdminDestinationStatus(dest.id, nextStatus);
      setActionSuccess(`Destination status updated for "${dest.name}".`);
      loadDestinations();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle status.");
    }
  };

  const handleDeleteDestination = async () => {
    if (!destToDelete) return;
    try {
      const res = await deleteAdminDestination(destToDelete.id);
      setActionSuccess(res.message || `Destination deleted successfully.`);
      setDestToDelete(null);
      loadDestinations();
      loadStats();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete destination.");
    }
  };

  return (
    <AppShell>
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-purple-200 backdrop-blur-md border border-white/10">
              <MapPin className="h-3.5 w-3.5 text-purple-300" />
              Catalog Management
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Destination Catalog Control
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-slate-300 leading-relaxed">
              Add new global travel destinations, update coordinates, manage categories, and toggle catalog visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Add Destination
            </button>
            <button
              onClick={() => {
                loadDestinations();
                loadStats();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-white/20 border border-white/10"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Destinations</span>
          <p className="mt-1 text-2xl font-black text-slate-900">{stats?.totalDestinations ?? totalElements}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active in Catalog</span>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats?.activeDestinations ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Inactive Catalog</span>
          <p className="mt-1 text-2xl font-black text-rose-600">{stats?.inactiveDestinations ?? 0}</p>
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
            placeholder="Search by city or country…"
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
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Metropolitan">Metropolitan</option>
            <option value="Beach & Nature">Beach & Nature</option>
            <option value="Historical">Historical</option>
            <option value="Cultural">Cultural</option>
            <option value="Coastal">Coastal</option>
            <option value="Mountain & Nature">Mountain & Nature</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-600 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Destination</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Coordinates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold text-slate-500">Loading catalog destinations…</p>
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-semibold text-slate-500">
                    No destinations found matching selected criteria.
                  </td>
                </tr>
              ) : (
                destinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={dest.imageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34"}
                          alt={dest.name}
                          className="h-12 w-12 rounded-xl object-cover shadow-sm border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{dest.name}</p>
                          <p className="text-xs text-slate-500">{dest.country}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        {dest.category || "General"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {dest.latitude != null && dest.longitude != null ? (
                        <span>{dest.latitude.toFixed(2)}°, {dest.longitude.toFixed(2)}°</span>
                      ) : (
                        <span className="text-slate-400">Not set</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(dest)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          dest.active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {dest.active ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                        {dest.active ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dest)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                          title="Edit Destination"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDestToDelete(dest)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Destination"
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
            Showing Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} destinations)
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

      {/* Create / Edit Destination Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingDestination ? `Edit "${editingDestination.name}"` : "Add New Destination"}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Destination Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Paris"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. France"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Paris"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="Metropolitan">Metropolitan</option>
                    <option value="Beach & Nature">Beach & Nature</option>
                    <option value="Historical">Historical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Coastal">Coastal</option>
                    <option value="Mountain & Nature">Mountain & Nature</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of the destination..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingDestination ? "Update Destination" : "Create Destination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {destToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Destination?</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Are you sure you want to remove <strong>{destToDelete.name}</strong> ({destToDelete.country})? If active trips use this destination, it will be safely deactivated.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 justify-end">
              <button
                onClick={() => setDestToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDestination}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
