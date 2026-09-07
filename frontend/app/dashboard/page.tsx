"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDestinations, getTrips } from "../../lib/api";
import type { Destination, Trip, User } from "../../lib/types";
import { motion } from "framer-motion";
import {
  Calendar,
  Compass,
  MapPin,
  Luggage,
  ArrowRight,
  Sparkles,
  Users,
  Plus,
  RefreshCw,
  Heart,
  Star,
  CheckCircle2,
  Clock,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));

      const [destinationData, tripData] = await Promise.all([
        getDestinations(),
        getTrips(),
      ]);
      setDestinations(destinationData);
      setTrips(tripData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const completedTrips = trips.filter((trip) => new Date(trip.endDate) < new Date()).length;
  const upcomingTrips = trips.filter((trip) => new Date(trip.endDate) >= new Date()).length;
  const countries = new Set(trips.map((trip) => trip.destination?.country).filter(Boolean)).size;

  const featuredTrip = trips.length > 0 ? trips[0] : null;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Formatted current date
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <AppShell>
      {/* GREETING & HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#6B7280] shadow-2xs mb-2">
            <Calendar className="h-3.5 w-3.5 text-[#4338CA]" />
            <span>{currentDate}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
            {user?.name ? `${greeting}, ${user.name.split(" ")[0]} 👋` : `${greeting} 👋`}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">Where would you like to explore next?</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#111827] shadow-2xs hover:bg-[#F1F1EF] transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#6B7280] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Plan a trip</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs font-semibold text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadDashboard} className="underline text-rose-800">Retry</button>
        </div>
      )}

      {/* FEATURED TRIP BANNER */}
      {featuredTrip ? (
        <section className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#111827] text-white shadow-lg group">
            <div className="absolute inset-0">
              <img
                src={
                  featuredTrip.destination?.imageUrl ||
                  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
                }
                alt={featuredTrip.title}
                className="h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />
            </div>

            <div className="relative p-7 sm:p-10 flex flex-col justify-end min-h-[300px]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  Featured Journey
                </span>
                <span className="rounded-full bg-emerald-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  Upcoming
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{featuredTrip.title}</h2>
              <p className="mt-2 text-sm text-white/80 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>{featuredTrip.destination?.name || "Destination"}, {featuredTrip.destination?.country}</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
                <div className="flex flex-wrap items-center gap-6 text-xs text-white/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-300" />
                    <span>{formatDate(featuredTrip.startDate)} – {formatDate(featuredTrip.endDate)}</span>
                  </div>
                  {featuredTrip.budget && (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-400" />
                      <span>₹{featuredTrip.budget.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/trips/${featuredTrip.id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#111827] shadow-sm hover:bg-slate-100 transition"
                >
                  <span>View Trip Details</span>
                  <ArrowRight className="h-4 w-4 text-[#4338CA]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-10 rounded-3xl border border-[#E5E7EB] bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-[#4338CA]">
            <Compass className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#111827]">No active trips found</h3>
          <p className="mt-1 text-xs text-[#6B7280]">Start planning your next travel adventure today.</p>
          <Link
            href="/trips/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#4338CA] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Trip</span>
          </Link>
        </section>
      )}

      {/* QUICK STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4338CA]">
              <Luggage className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-[#111827]">{loading ? "…" : trips.length}</span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#6B7280]">Total Trips Planned</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-[#111827]">{loading ? "…" : completedTrips}</span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#6B7280]">Completed Journeys</p>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-2xl font-extrabold text-[#111827]">{loading ? "…" : countries}</span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#6B7280]">Countries Explored</p>
        </div>
      </div>

      {/* MAIN LAYOUT: RECENT TRIPS & DESTINATIONS */}
      <div className="grid gap-8 xl:grid-cols-12">
        {/* RECENT TRIPS CARDS (8 Cols) */}
        <div className="xl:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#111827]">Recent Trips</h2>
              <p className="text-xs text-[#6B7280]">Your upcoming and past itineraries</p>
            </div>
            <Link href="/trips" className="text-xs font-semibold text-[#4338CA] hover:underline flex items-center gap-1">
              View all trips <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : trips.length === 0 ? (
            <EmptyTripsState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {trips.slice(0, 4).map((trip) => {
                const isPast = new Date(trip.endDate) < new Date();
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-2xs hover:shadow-md hover:border-[#D1D5DB] transition duration-200"
                  >
                    <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
                      <img
                        src={
                          trip.destination?.imageUrl ||
                          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={trip.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs ${
                        isPast ? "bg-slate-800/80" : "bg-emerald-600/90"
                      }`}>
                        {isPast ? "Completed" : "Upcoming"}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#111827] group-hover:text-[#4338CA] transition">{trip.title}</h3>
                    <p className="mt-0.5 text-xs text-[#6B7280] flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {trip.destination?.name || "Destination"}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-[#F1F1EF] pt-3 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDate(trip.startDate)}
                      </span>
                      {trip.budget && (
                        <span className="font-semibold text-[#111827]">
                          ₹{trip.budget.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* EXPLORE DESTINATIONS SIDEBAR (4 Cols) */}
        <div className="xl:col-span-4 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#111827]">Explore Spots</h2>
              <p className="text-xs text-[#6B7280]">Popular destination picks</p>
            </div>
            <Link href="/destinations" className="text-xs font-semibold text-[#4338CA] hover:underline">
              Browse
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : destinations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6 text-center text-xs text-[#6B7280]">
              No destinations loaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {destinations.slice(0, 4).map((dest) => (
                <Link
                  key={dest.id}
                  href={`/destinations/${dest.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-2xs hover:border-[#D1D5DB] transition"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={dest.imageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80"}
                      alt={dest.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-bold text-[#111827] group-hover:text-[#4338CA] transition">{dest.name}</h4>
                    <p className="truncate text-[11px] text-[#6B7280]">{dest.country || dest.city || "Explore"}</p>
                  </div>
                  <button
                    onClick={(e) => toggleFavorite(dest.id, e)}
                    className="p-1 text-[#9CA3AF] hover:text-rose-500 transition"
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(dest.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="h-32 w-full rounded-xl bg-slate-200 mb-3" />
          <div className="h-4 w-2/3 rounded bg-slate-200 mb-2" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyTripsState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 text-center">
      <p className="text-xs font-semibold text-[#6B7280]">No trips created yet.</p>
      <Link
        href="/trips/new"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline"
      >
        <span>Plan your first trip</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "";
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  } catch {
    return value;
  }
}
