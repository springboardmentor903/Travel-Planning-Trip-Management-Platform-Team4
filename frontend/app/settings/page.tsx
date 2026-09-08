"use client";

import AppShell from "../../components/AppShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "../../lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
    }
  }, []);

  const signOut = () => {
    setSigningOut(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.replace("/login");
  };

  return (
    <AppShell>
      <div className="mb-7">
        <p className="text-sm font-bold text-indigo-600">Preferences</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your session credentials and security settings.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-extrabold text-slate-900">Session & Authentication</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your session is secured using Spring Boot stateless JWT tokens.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Account
              </p>
              <p className="mt-1 text-base font-bold text-slate-800">
                {user?.name || "Traveler"}
              </p>
              <p className="text-xs text-slate-500">{user?.email || "No email"}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Status
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">Valid JWT Authenticated</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={signOut}
              disabled={signingOut}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "🚪 Sign out of TripNest"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
              🔐
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">Security Details</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              All protected API requests automatically attach the stored bearer token:
            </p>
            <code className="mt-3 block rounded-lg bg-slate-100 p-2.5 text-[11px] font-mono text-slate-700 break-all">
              Authorization: Bearer &lt;token&gt;
            </code>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              When token expires, requests receive a 401 response and redirect safely to login.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
              🌐
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">API Connection</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Frontend communicates with Spring Boot backend at:
            </p>
            <code className="mt-2 block rounded-lg bg-slate-100 p-2 text-[11px] font-mono text-indigo-700">
              http://localhost:8080/api
            </code>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
