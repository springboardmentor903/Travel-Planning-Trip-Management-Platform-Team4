"use client";

import AppShell from "../../components/AppShell";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = () => {
    setSigningOut(true);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return <AppShell><div className="mb-7"><p className="text-sm font-bold text-indigo-600">Account</p><h1 className="mt-1 text-3xl font-extrabold">Account Settings</h1><p className="mt-2 text-sm text-slate-500">Only settings supported by the current backend are shown as active actions.</p></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><h2 className="text-xl font-extrabold">Authentication</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your current backend provides JWT authentication through the login endpoint. Sign out clears the local access token and returns you to login.</p><button onClick={signOut} disabled={signingOut} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50">{signingOut ? "Signing out…" : "Sign out"}</button><div className="my-8 border-t border-slate-100" /><h2 className="text-xl font-extrabold">Notifications & privacy</h2><p className="mt-2 text-sm leading-6 text-slate-500">The current Spring Boot backend does not expose notification, privacy, or account-settings endpoints. The frontend does not use fake local-only settings.</p><div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">These controls can be enabled as soon as the corresponding backend endpoints are implemented.</div></section><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">🔐</div><h2 className="mt-4 font-extrabold">Security</h2><p className="mt-2 text-sm leading-6 text-slate-500">API requests from protected pages automatically send the JWT stored by the login flow.</p></aside></div></AppShell>;
}
