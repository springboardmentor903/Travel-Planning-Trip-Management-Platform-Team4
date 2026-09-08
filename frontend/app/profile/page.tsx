"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "../../lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TN";

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">Account</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">User Profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Account details and authenticated session credentials.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* User Card */}
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-2xl font-extrabold text-indigo-700">
            {initials}
          </div>
          <h2 className="mt-5 text-xl font-extrabold text-slate-900">
            {user?.name || "Traveler"}
          </h2>
          <p className="mt-1 break-all text-sm text-slate-500">{user?.email || "No email"}</p>
          <div className="mt-4">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              ● Authenticated Session
            </span>
          </div>
        </section>

        {/* Account Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <h2 className="text-xl font-extrabold text-slate-900">Personal Information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Information retrieved from your secure authentication token.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Info label="User ID" value={loading ? "Loading…" : String(user?.id ?? "N/A")} />
            <Info label="Full Name" value={user?.name || "Not available"} />
            <Info label="Email Address" value={user?.email || "Not available"} />
            <Info label="Account Role" value="TRAVELER" />
          </div>

          <div className="my-8 border-t border-slate-100" />

          <h2 className="text-xl font-extrabold text-slate-900">Travel Planning Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage your travel history, explore new destinations, or review system notifications.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/trips"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              ✈️ My Trips
            </Link>
            <Link
              href="/destinations"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              🌍 Browse Destinations
            </Link>
            <Link
              href="/notifications"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              🔔 Notifications & Reminders
            </Link>
            <Link
              href="/settings"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
            >
              ⚙️ Account Settings
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 break-words text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
