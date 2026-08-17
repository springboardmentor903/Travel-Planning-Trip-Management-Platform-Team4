"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import type { Destination, Trip } from "../../../lib/types";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editing, setEditing] = useState(searchParams.get("edit") === "1");
  const [form, setForm] = useState({ title: "", description: "", destinationId: "", startDate: "", endDate: "", budget: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [tripData, destinationData] = await Promise.all([
        apiFetch<Trip>(`/trips/${params.id}`),
        apiFetch<Destination[]>("/destinations"),
      ]);
      setTrip(tripData);
      setDestinations(destinationData);
      setForm({ title: tripData.title, description: tripData.description || "", destinationId: String(tripData.destination.id), startDate: tripData.startDate, endDate: tripData.endDate, budget: tripData.budget == null ? "" : String(tripData.budget) });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load trip."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [params.id]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      await apiFetch<Trip>(`/trips/${params.id}`, { method: "PUT", body: JSON.stringify({ ...form, destinationId: Number(form.destinationId), budget: form.budget ? Number(form.budget) : null }) });
      setEditing(false); router.replace(`/trips/${params.id}`); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update trip."); }
    finally { setSaving(false); }
  };

  const deleteTrip = async () => {
    if (!confirm("Delete this trip?")) return;
    try { await apiFetch<void>(`/trips/${params.id}`, { method: "DELETE" }); router.push("/trips"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to delete trip."); }
  };

  return <AppShell><div className="mb-7"><Link href="/trips" className="text-sm font-bold text-indigo-600">← Trip History</Link></div>{error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading trip from backend…</div> : !trip ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">Trip not found.</div> : editing ? <EditForm form={form} setForm={setForm} destinations={destinations} saving={saving} onSubmit={save} onCancel={() => { setEditing(false); router.replace(`/trips/${params.id}`); }} /> : <TripView trip={trip} onEdit={() => setEditing(true)} onDelete={deleteTrip} />}</AppShell>;
}

function TripView({ trip, onEdit, onDelete }: { trip: Trip; onEdit: () => void; onDelete: () => void }) { const completed = new Date(trip.endDate) < new Date(); return <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><div className="flex flex-col justify-between gap-5 md:flex-row"><div><span className={`rounded-full px-3 py-1 text-xs font-bold ${completed ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>{completed ? "Completed" : "Upcoming"}</span><h1 className="mt-4 text-3xl font-extrabold">{trip.title}</h1><p className="mt-2 text-lg font-bold text-indigo-600">{trip.destination.name}</p></div><div className="flex gap-2"><button onClick={onEdit} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Edit</button><button onClick={onDelete} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600">Delete</button></div></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><Info label="Dates" value={`${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`} /><Info label="Budget" value={trip.budget == null ? "Not set" : formatBudget(Number(trip.budget))} /><Info label="Location" value={trip.destination.location || trip.destination.city || trip.destination.country || "Not provided"} /></div><div className="mt-8 border-t border-slate-100 pt-7"><h2 className="text-xl font-extrabold">Description</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">{trip.description || "No description provided."}</p></div><div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5"><p className="text-sm font-bold text-amber-800">Itinerary & activities</p><p className="mt-1 text-sm leading-6 text-amber-700">The current backend does not expose itinerary/activity endpoints yet, so this section intentionally shows no fake data.</p></div></section>; }

function EditForm({ form, setForm, destinations, saving, onSubmit, onCancel }: { form: any; setForm: (v: any) => void; destinations: Destination[]; saving: boolean; onSubmit: (e: React.FormEvent) => void; onCancel: () => void }) { const update = (key: string, value: string) => setForm({ ...form, [key]: value }); return <form onSubmit={onSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h1 className="text-2xl font-extrabold">Edit trip</h1><div className="mt-6 grid gap-5 md:grid-cols-2"><Field label="Title"><input required value={form.title} onChange={(e) => update("title", e.target.value)} className="input" /></Field><Field label="Destination"><select required value={form.destinationId} onChange={(e) => update("destinationId", e.target.value)} className="input">{destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field><Field label="Start date"><input required type="date" value={form.startDate} onChange={(e) => update("startDate", e.target.value)} className="input" /></Field><Field label="End date"><input required type="date" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className="input" /></Field><Field label="Budget"><input type="number" min="0" value={form.budget} onChange={(e) => update("budget", e.target.value)} className="input" /></Field></div><div className="mt-5"><Field label="Description"><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input min-h-32" /></Field></div><div className="mt-7 flex gap-3"><button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">Cancel</button></div></form>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm font-bold text-slate-700">{value}</p></div>; }
function formatDate(value: string) { return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }); }
function formatBudget(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value); }
