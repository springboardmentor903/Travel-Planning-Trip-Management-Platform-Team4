"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminDashboard } from "../../../lib/api";
import type { AdminDashboard } from "../../../lib/types";

export default function AdminDashboardPage() {
  const [data,setData]=useState<AdminDashboard|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const load=async()=>{setLoading(true);setError("");try{setData(await getAdminDashboard());}catch(e){setError(e instanceof Error?e.message:"Unable to load admin dashboard.");}finally{setLoading(false);}};
  useEffect(()=>{load();},[]); const money=(n:number)=>`₹${Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}`;
  if(loading) return <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Loading admin dashboard…</main>;
  if(error) return <main className="min-h-screen bg-slate-50 p-8"><div className="mx-auto max-w-xl rounded-2xl bg-red-50 p-6 text-red-700">{error}<button onClick={load} className="ml-4 font-bold underline">Retry</button></div></main>;
  if(!data) return null;
  return <main className="min-h-screen bg-slate-50 p-5 sm:p-8"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-900 p-7 text-white"><div><p className="text-sm font-semibold text-indigo-300">Administrator-only area</p><h1 className="mt-1 text-3xl font-extrabold">Platform Dashboard</h1><p className="mt-2 text-slate-300">Real-time aggregated statistics across TripNest.</p></div><div className="flex gap-3"><button onClick={load} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold">Refresh</button><Link href="/dashboard" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">Traveler view</Link></div></div>
    <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Card title="Registered Users" value={String(data.totalRegisteredUsers)} icon="👥"/><Card title="Total Trips" value={String(data.tripAnalytics.totalTrips)} icon="✈️"/><Card title="Active Trips" value={String(data.tripAnalytics.activeTrips)} icon="🟢"/><Card title="Completed Trips" value={String(data.tripAnalytics.completedTrips)} icon="✓"/></section>
    <section className="mt-7 grid gap-6 lg:grid-cols-2"><Panel title="Popular Destinations" subtitle="Ranked by trips created across all users">{data.popularDestinations.length?<div className="space-y-3">{data.popularDestinations.slice(0,8).map((d,i)=><div key={d.destinationId} className="flex justify-between rounded-xl border border-slate-200 p-4"><div><b>#{i+1} {d.destinationName}</b><p className="text-sm text-slate-500">{d.country}</p></div><b className="text-indigo-700">{d.visitCount} trips</b></div>)}</div>:<Empty/>}</Panel><Panel title="Platform Stats" subtitle="Overall operational totals"><div className="grid gap-4 sm:grid-cols-2"><Stat title="Total expenses logged" value={money(data.platformStats.totalExpenses)}/><Stat title="Notifications sent" value={String(data.platformStats.totalNotificationsSent)}/></div></Panel></section>
  </div></main>;
}
function Card({title,value,icon}:{title:string;value:string;icon:string}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-2xl">{icon}</span><b className="mt-4 block text-3xl">{value}</b><p className="mt-1 text-sm font-semibold text-slate-500">{title}</p></div>}
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold">{title}</h2><p className="mb-5 mt-1 text-sm text-slate-500">{subtitle}</p>{children}</section>}
function Stat({title,value}:{title:string;value:string}){return <div className="rounded-xl bg-indigo-50 p-5"><p className="text-sm font-semibold text-slate-600">{title}</p><b className="mt-2 block text-2xl text-indigo-800">{value}</b></div>}
function Empty(){return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No trip data available yet.</div>}
