"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id?: number | string;
  name?: string;
  email?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/trips", label: "Trip History", icon: "✈" },
  { href: "/profile", label: "Profile", icon: "◯" },
  { href: "/settings", label: "Account Settings", icon: "⚙" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "TN";

  const pageTitle =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname === "/trips"
        ? "Trip History"
        : pathname === "/profile"
          ? "Profile"
          : "Account Settings";

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans text-slate-900 antialiased">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-md lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 text-xl text-white shadow-lg shadow-indigo-200 transition duration-300 hover:scale-105">
            ✈️
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">TripNest</p>
            <p className="text-xs font-semibold text-indigo-600">Travel Planner Platform</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-extrabold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-indigo-600"
                }`}
              >
                <span className={`flex w-5 justify-center text-lg ${active ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-extrabold text-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-900">{user?.name || "Traveler"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "Welcome back"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-2xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white">✈️</div>
                <div>
                  <p className="font-extrabold text-slate-900">TripNest</p>
                  <p className="text-[11px] text-indigo-600 font-semibold">Travel Planner</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-2xl font-bold text-slate-400 hover:text-slate-600">×</button>
            </div>
            <nav className="space-y-1.5 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    pathname === item.href
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold shadow-xs lg:hidden"
                aria-label="Open navigation"
              >
                ☰
              </button>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">{pageTitle}</h1>
                <p className="hidden text-xs font-medium text-slate-500 sm:block">Plan better. Travel smarter.</p>
              </div>
            </div>

            <Link
              href="/profile"
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 sm:px-3.5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-[11px] font-extrabold text-white shadow-xs">
                {initials}
              </span>
              <span className="hidden sm:block">{user?.name || "Profile"}</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>
    </div>
  );
}

