"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import type { Trip } from "../../lib/types";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      setTrips(await apiFetch<Trip[]>("/trips/my"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTrips(); }, []);

  const completed = useMemo(() => trips.filter((trip) => new Date(trip.endDate) < new Date()).length, [trips]);
  const upcoming = trips.length - completed;
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);

  return (
    <AppShell>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold text-indigo-600">Your journeys</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Trip History</h1><p className="mt-2 text-sm text-slate-500">Every trip below is loaded from your authenticated backend account.</p></div>
        <div className="flex gap-3"><button onClick={loadTrips} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-slate-50">Refresh</button><Link href="/trips/new" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">+ Plan trip</Link></div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <div className="grid gap-5 md:grid-cols-3">
        <Stat title="Total trips" value={loading ? "…" : String(trips.length)} icon="🧳" />
        <Stat title="Completed" value={loading ? "…" : String(completed)} icon="✓" />
        <Stat title="Upcoming" value={loading ? "…" : String(upcoming)} icon="📅" />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-extrabold">All trips</h2><p className="mt-1 text-sm text-slate-500">Backend source: GET /api/trips/my</p></div>{!loading && <p className="text-sm font-semibold text-slate-500">Budget total: {formatBudget(totalBudget)}</p>}</div>
        {loading ? <Loading /> : trips.length === 0 ? <Empty /> : <div className="space-y-4">{trips.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={loadTrips} />)}</div>}
      </section>
    </AppShell>
  );
}

function TripCard({ trip, onDelete }: { trip: Trip; onDelete: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const completed = new Date(trip.endDate) < new Date();
  const deleteTrip = async () => {
    if (!confirm(`Delete "${trip.title}"?`)) return;
    setDeleting(true);
    try {
      const { apiFetch } = await import("../../lib/api");
      await apiFetch<void>(`/trips/${trip.id}`, { method: "DELETE" });
      onDelete();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unable to delete trip.");
    } finally { setDeleting(false); }
  };

  return <article className="rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-extrabold">{trip.title}</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${completed ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{completed ? "Completed" : "Upcoming"}</span></div><p className="mt-1 text-sm font-semibold text-indigo-600">{trip.destination?.name || "Destination unavailable"}</p><p className="mt-2 text-sm text-slate-500">{trip.description || "No trip description."}</p></div><div className="grid shrink-0 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-1 lg:text-right"><span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span><span>Budget: {trip.budget == null ? "Not set" : formatBudget(Number(trip.budget))}</span></div></div><div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4"><Link href={`/trips/${trip.id}`} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100">View trip</Link><Link href={`/trips/${trip.id}?edit=1`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Edit</Link><button disabled={deleting} onClick={deleteTrip} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">{deleting ? "Deleting…" : "Delete"}</button></div></article>;
}

function Stat({ title, value, icon }: { title: string; value: string; icon: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">{icon}</div><strong className="text-2xl">{value}</strong></div><p className="mt-4 text-sm font-semibold text-slate-500">{title}</p></div>; }
function Loading() { return <div className="rounded-xl bg-slate-50 p-10 text-center text-sm font-semibold text-slate-500">Loading trips from backend…</div>; }
function Empty() { return <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center"><p className="font-bold">No trips found</p><p className="mt-1 text-sm text-slate-500">Create your first trip and it will appear here.</p><Link href="/trips/new" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Create trip</Link></div>; }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }); }
function formatBudget(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
