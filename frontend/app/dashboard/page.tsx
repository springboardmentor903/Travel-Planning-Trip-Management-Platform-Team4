"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDestinations, getTrips } from "../../lib/api";
import type { Destination, Trip, User } from "../../lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  const countries = new Set(trips.map((trip) => trip.destination?.country).filter(Boolean)).size;

  return (
    <AppShell>
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">Your travel workspace</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {user?.name ? `Welcome back, ${user.name}` : "Welcome back"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
          Your dashboard is connected to the TripNest backend. Trips and destinations below are loaded from the API.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/trips/new" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50">
            + Plan a trip
          </Link>
          <button onClick={loadDashboard} className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold hover:bg-white/20">
            Refresh data
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <SummaryCard icon="🧳" title="My trips" value={loading ? "…" : String(trips.length)} />
        <SummaryCard icon="✓" title="Completed trips" value={loading ? "…" : String(completedTrips)} />
        <SummaryCard icon="🌍" title="Countries in trips" value={loading ? "…" : String(countries)} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Destinations</h2>
              <p className="mt-1 text-sm text-slate-500">Loaded from GET /api/destinations.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Backend</span>
          </div>

          {loading ? <Loading /> : destinations.length === 0 ? <EmptyState text="No destinations are available in the backend yet." /> : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {destinations.map((destination) => (
                <Link key={destination.id} href={`/destinations/${destination.id}`} className="group rounded-2xl border border-slate-200 p-4 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
                  <div className="mb-4 h-28 overflow-hidden rounded-xl bg-slate-100">
                    {destination.imageUrl ? (
                      <img src={destination.imageUrl} alt={destination.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl">🌍</div>
                    )}
                  </div>
                  <h3 className="font-bold">{destination.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{destination.city || destination.location || destination.country || "Location not provided"}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{destination.description || "No description provided."}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold">Latest trips</h2>
            <p className="mt-1 text-sm text-slate-500">Your authenticated trip data.</p>
          </div>
          {loading ? <Loading /> : trips.length === 0 ? <EmptyState text="You have not created any trips yet." /> : (
            <div className="space-y-3">
              {trips.slice(0, 4).map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.id}`} className="block rounded-xl border border-slate-200 p-4 hover:border-indigo-200 hover:bg-indigo-50/30">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{trip.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{trip.destination?.name || "Destination unavailable"}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">#{trip.id}</span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</p>
                </Link>
              ))}
            </div>
          )}
          <Link href="/trips" className="mt-5 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700">View trip history →</Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <BackendFeatureCard title="Travel preferences" description="No preferences API exists in the current backend. This frontend does not invent or persist fake preference data." href="/profile" action="Open profile" />
        <BackendFeatureCard title="Favourite destinations" description="No favourites API exists in the current backend. The UI will be connected when that endpoint is added." href="/profile" action="Open profile" />
      </section>
    </AppShell>
  );
}

function SummaryCard({ icon, title, value }: { icon: string; title: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">{icon}</div><span className="text-2xl font-extrabold">{value}</span></div><p className="mt-4 text-sm font-semibold text-slate-500">{title}</p></div>;
}

function BackendFeatureCard({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><Link href={href} className="mt-5 inline-flex text-sm font-bold text-indigo-600">{action} →</Link></div>;
}

function Loading() { return <div className="rounded-xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Loading from backend…</div>; }
function EmptyState({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text}</div>; }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }); }
