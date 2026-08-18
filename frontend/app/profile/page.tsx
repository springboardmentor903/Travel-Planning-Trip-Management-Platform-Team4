"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import type { User } from "../../lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }
    apiFetch<string>("/test/protected")
      .then(() => setVerified(true))
      .catch((err) => setMessage(err instanceof Error ? err.message : "Unable to verify session."))
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U";

  return <AppShell><div className="mb-7"><p className="text-sm font-bold text-indigo-600">Account</p><h1 className="mt-1 text-3xl font-extrabold">Profile</h1><p className="mt-2 text-sm text-slate-500">This page displays the authenticated user returned by the login service.</p></div>{message && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{message}</div>}<div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]"><section className="h-fit rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-2xl font-extrabold text-indigo-700">{initials}</div><h2 className="mt-5 text-xl font-extrabold">{user?.name || "Loading user…"}</h2><p className="mt-1 break-all text-sm text-slate-500">{user?.email || ""}</p>{verified && <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Authenticated</span>}</section><section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-extrabold">Personal information</h2><p className="mt-1 text-sm text-slate-500">These values come from the authenticated backend login response.</p><div className="mt-6 grid gap-5 md:grid-cols-2"><Info label="User ID" value={loading ? "Loading…" : String(user?.id ?? "Not available")} /><Info label="Full name" value={user?.name || "Not available"} /><Info label="Email" value={user?.email || "Not available"} /><Info label="Session" value={verified ? "Valid" : "Checking…"} /></div><div className="my-8 border-t border-slate-100" /><h2 className="text-xl font-extrabold">Travel preferences</h2><p className="mt-2 text-sm leading-6 text-slate-500">The current backend does not expose a preferences endpoint or a preferences entity. This frontend intentionally does not invent or store fake preference values.</p><div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">Preferences will appear here when a backend preferences API is available.</div><div className="my-8 border-t border-slate-100" /><h2 className="text-xl font-extrabold">Favourite destinations</h2><p className="mt-2 text-sm leading-6 text-slate-500">The current backend does not expose a favourites endpoint. No fake favourites are shown.</p><Link href="/dashboard" className="mt-5 inline-flex text-sm font-bold text-indigo-600">Browse backend destinations →</Link></section></div></AppShell>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 break-words text-sm font-bold text-slate-700">{value}</p></div>; }
