"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { Destination } from "../../../lib/types";

export default function DestinationDetailPage() {
  const params = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Destination>(`/destinations/${params.id}`)
      .then(setDestination)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load destination."))
      .finally(() => setLoading(false));
  }, [params.id]);

  return <AppShell><div className="mb-7"><Link href="/dashboard" className="text-sm font-bold text-indigo-600">← Dashboard</Link></div>{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading destination…</div> : !destination ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">Destination not found.</div> : <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="h-64 bg-slate-100">{destination.imageUrl ? <img src={destination.imageUrl} alt={destination.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-7xl">🌍</div>}</div><div className="p-7 sm:p-9"><p className="text-sm font-bold text-indigo-600">{destination.country || destination.location || "Destination"}</p><h1 className="mt-2 text-3xl font-extrabold">{destination.name}</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">{destination.description || "No description provided by the backend."}</p><div className="mt-7 grid gap-4 sm:grid-cols-3"><Info label="City" value={destination.city || "Not provided"} /><Info label="Location" value={destination.location || "Not provided"} /><Info label="Country" value={destination.country || "Not provided"} /></div><div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="font-bold text-amber-800">Live weather</p><p className="mt-1 text-sm leading-6 text-amber-700">The current Spring Boot destination API does not return weather data yet. No fake weather is displayed.</p></div></div></section>}</AppShell>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>; }
