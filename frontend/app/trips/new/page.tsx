"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { Destination, Trip } from "../../../lib/types";
import { useRouter } from "next/navigation";

export default function NewTripPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Destination[]>("/destinations")
      .then(setDestinations)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load destinations."))
      .finally(() => setPageLoading(false));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!destinationId) return setError("Select a destination.");
    if (endDate < startDate) return setError("End date cannot be before start date.");

    setLoading(true);
    try {
      const trip = await apiFetch<Trip>("/trips", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          destinationId: Number(destinationId),
          startDate,
          endDate,
          budget: budget ? Number(budget) : null,
        }),
      });
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create trip.");
    } finally { setLoading(false); }
  };

  return <AppShell><div className="mb-7"><Link href="/trips" className="text-sm font-bold text-indigo-600">← Trip History</Link><h1 className="mt-3 text-3xl font-extrabold">Plan a new trip</h1><p className="mt-2 text-sm text-slate-500">This form creates a real trip through POST /api/trips.</p></div>{error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}<form onSubmit={submit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="grid gap-5 md:grid-cols-2"><Field label="Trip title"><input required value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Weekend getaway" /></Field><Field label="Destination"><select required disabled={pageLoading} value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="input"><option value="">{pageLoading ? "Loading destinations…" : "Select destination"}</option>{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}{d.country ? ` — ${d.country}` : ""}</option>)}</select></Field><Field label="Start date"><input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" /></Field><Field label="End date"><input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input" /></Field><Field label="Budget (INR)"><input min="0" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="input" placeholder="Optional" /></Field></div><div className="mt-5"><Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-32 resize-y" placeholder="What is this trip about?" /></Field></div><div className="mt-7 flex gap-3"><button disabled={loading || pageLoading} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{loading ? "Creating…" : "Create trip"}</button><Link href="/trips" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</Link></div></form></AppShell>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
