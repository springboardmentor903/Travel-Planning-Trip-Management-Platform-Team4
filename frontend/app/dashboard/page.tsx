"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getTravelerDashboard } from "../../lib/api";
import type { TravelerDashboard, User } from "../../lib/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<TravelerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
      setData(await getTravelerDashboard());
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load dashboard."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  return <AppShell>
    <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">Traveler dashboard</p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{user?.name ? `Welcome back, ${user.name}` : "Welcome back"}</h1>
      <p className="mt-3 text-indigo-100">Your trips, budgets, expenses and travel insights in one place.</p>
      <div className="mt-6 flex gap-3"><Link href="/trips/new" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700">+ Plan a trip</Link><button onClick={load} className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold">Refresh</button></div>
    </section>
    {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}
    {loading || !data ? <Loading /> : <>
      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Card icon="🧳" title="Trips taken" value={String(data.travelStats.totalTripsTaken)} />
        <Card icon="🌍" title="Destinations visited" value={String(data.travelStats.totalDestinationsVisited)} />
        <Card icon="🗺️" title="Countries visited" value={String(data.travelStats.totalCountriesVisited)} />
        <Card icon="💸" title="Total spent" value={money(data.travelStats.totalAmountSpent)} />
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming Trips" subtitle="Future trips ordered by nearest start date">
          {data.upcomingTrips.length ? <div className="space-y-3">{data.upcomingTrips.map(t => <Link key={t.id} href={`/trips/${t.id}`} className="block rounded-xl border border-slate-200 p-4 hover:border-indigo-300"><b>{t.title}</b><p className="mt-1 text-sm text-slate-500">{t.destination.name} · {formatDate(t.startDate)} – {formatDate(t.endDate)}</p></Link>)}</div> : <Empty text="No upcoming trips." />}
        </Panel>
        <Panel title="Budget Overview" subtitle="Across all your trips">
          <div className="grid grid-cols-2 gap-4"><Metric label="Total budget" value={money(data.budgetOverview.totalBudget)} /><Metric label="Actually spent" value={money(data.budgetOverview.totalSpent)} /></div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, data.budgetOverview.totalBudget ? (data.budgetOverview.totalSpent / data.budgetOverview.totalBudget) * 100 : 0)}%` }} /></div>
        </Panel>
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Expense Summary" subtitle="Category breakdown across all trips">
          {data.expenseSummary.length ? <div className="space-y-4">{data.expenseSummary.map(x => { const max=Math.max(...data.expenseSummary.map(a=>Number(a.totalAmount))); return <div key={x.category}><div className="flex justify-between text-sm"><span className="font-semibold">{x.category.replaceAll("_", " ")}</span><span>{money(x.totalAmount)}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-500" style={{width:`${max ? Number(x.totalAmount)/max*100 : 0}%`}} /></div></div>; })}</div> : <Empty text="No expenses logged yet." />}
        </Panel>
        <Panel title="Favorite / Most-Visited Destinations" subtitle="Based on how many trips you created">
          {data.favoriteDestinations.length ? <div className="space-y-3">{data.favoriteDestinations.slice(0,5).map((d,i)=><div key={d.destinationId} className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><div><b>#{i+1} {d.destinationName}</b><p className="text-sm text-slate-500">{d.country}</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{d.visitCount} visits</span></div>)}</div> : <Empty text="Visit data will appear after creating trips." />}
        </Panel>
      </section>
    </>}
  </AppShell>;
}
function Card({icon,title,value}:{icon:string;title:string;value:string}) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-2xl">{icon}</span><b className="text-xl">{value}</b></div><p className="mt-4 text-sm font-semibold text-slate-500">{title}</p></div>; }
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}) { return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold">{title}</h2><p className="mb-5 mt-1 text-sm text-slate-500">{subtitle}</p>{children}</div>; }
function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><b className="mt-2 block text-xl">{value}</b></div>; }
function Empty({text}:{text:string}) { return <div className="rounded-xl border border-dashed border-slate-300 p-7 text-center text-sm text-slate-500">{text}</div>; }
function Loading(){return <div className="mt-8 rounded-2xl bg-white p-10 text-center text-slate-500">Loading dashboard…</div>;}
function formatDate(v:string){return new Date(`${v}T00:00:00`).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"});}
