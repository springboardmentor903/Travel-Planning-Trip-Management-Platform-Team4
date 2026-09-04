"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteTrip, getDestinations, getTrips } from "../../lib/api";
import type { Destination, Trip } from "../../lib/types";
import TripSearchModal from "../../components/trips/TripSearchModal";
import {
  Calendar,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  Clock,
  Wallet,
  Compass,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
      {/* HEADER & TOP ACTIONS */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">My Trips</h1>
          <p className="text-xs text-[#6B7280]">Manage your travel itineraries, expenses, and co-travelers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] shadow-2xs hover:bg-[#FAFAF9]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setSearchModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2.5 text-xs font-semibold text-[#4338CA] hover:bg-indigo-100"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Find & Join Trip</span>
          </button>

          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]"
          >
            <Plus className="h-4 w-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </div>

      {notification && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 flex items-center justify-between">
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* OVERVIEW STATS */}
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <StatCard title="Total Trips" value={trips.length} subtitle="All planned" icon={<Compass className="h-5 w-5 text-[#4338CA]" />} />
        <StatCard title="Active Now" value={activeCount} subtitle="Currently traveling" icon={<Sparkles className="h-5 w-5 text-emerald-600" />} />
        <StatCard title="Upcoming" value={upcomingCount} subtitle="Coming soon" icon={<Clock className="h-5 w-5 text-indigo-500" />} />
        <StatCard title="Completed" value={completedCount} subtitle="Past journeys" icon={<CheckCircle2 className="h-5 w-5 text-[#6B7280]" />} />
      </div>

      {/* TRIPS GRID WITH SEARCH & FILTER TABS */}
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by title or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-2 pl-10 pr-4 text-xs font-medium text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white"
            />
          </div>

          <div className="flex rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-1">
            {(["All", "Active", "Upcoming", "Completed"] as const).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    active ? "bg-white text-[#111827] shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#6B7280]">Loading trips...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAF9] p-12 text-center">
            <p className="text-xs font-semibold text-[#6B7280]">No trips found matching criteria.</p>
            <Link
              href="/trips/new"
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Create Trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => {
              const status = getTripStatus(trip.startDate, trip.endDate);
              return (
                <article
                  key={trip.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs hover:shadow-md hover:border-[#D1D5DB] transition duration-200"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-100 mb-4">
                      <img
                        src={
                          trip.destination?.imageUrl ||
                          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={trip.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[10px] font-bold text-white backdrop-blur-xs ${
                        status === "Active" ? "bg-emerald-600" : status === "Upcoming" ? "bg-[#4338CA]" : "bg-slate-800"
                      }`}>
                        {status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#111827] group-hover:text-[#4338CA] transition">{trip.title}</h3>
                    <p className="mt-1 text-xs text-[#6B7280] flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#4338CA]" />
                      <span>{trip.destination?.name || "Destination"}, {trip.destination?.country}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1 rounded-lg bg-[#FAFAF9] border border-[#E5E7EB] px-2.5 py-1">
                        <Calendar className="h-3 w-3" /> {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </span>
                      {trip.budget && (
                        <span className="flex items-center gap-1 rounded-lg bg-[#FAFAF9] border border-[#E5E7EB] px-2.5 py-1 font-semibold text-[#111827]">
                          <Wallet className="h-3 w-3 text-emerald-600" /> ₹{trip.budget.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F1F1EF] pt-4">
                    <Link
                      href={`/trips/${trip.id}`}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[#4338CA] hover:bg-indigo-100 transition"
                    >
                      View Details
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDeleteTarget(trip)}
                        className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-rose-50 hover:text-rose-600 transition"
                        title="Delete trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[#111827]">Confirm Deletion</h3>
            <p className="mt-2 text-xs text-[#6B7280]">
              Are you sure you want to delete trip <span className="font-bold text-[#111827]">"{deleteTarget.title}"</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#6B7280]"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH MODAL */}
      <TripSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </AppShell>
  );
}

function StatCard({ title, value, subtitle, icon }: { title: string; value: number | string; subtitle: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAFAF9]">{icon}</div>
        <span className="text-2xl font-extrabold text-[#111827]">{value}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-[#111827]">{title}</p>
      <p className="text-[11px] text-[#6B7280]">{subtitle}</p>
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
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  } catch {
    return value;
  }
}
