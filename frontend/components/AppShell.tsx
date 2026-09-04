"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Compass,
  Calendar,
  MapPin,
  Bookmark,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Plane,
  ChevronRight,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

type User = {
  id?: number | string;
  name?: string;
  email?: string;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Calendar },
  { href: "/destinations", label: "Explore", icon: Compass },
  { href: "/trips/new", label: "Trip Planner", icon: MapPin },
  { href: "/profile", label: "Favorites", icon: Bookmark },
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
  }, [router]);

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
      ? "My Trips"
      : pathname === "/destinations"
      ? "Explore Destinations"
      : pathname === "/trips/new"
      ? "Trip Planner"
      : pathname === "/profile"
      ? "Profile & Favorites"
      : "Settings";

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#111827] antialiased">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#E5E7EB] bg-white lg:flex">
        {/* Logo Header */}
        <div className="flex h-20 items-center gap-3 border-b border-[#F1F1EF] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827] text-white">
            <Plane className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-[#111827]">TripNest</span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#4338CA] bg-indigo-50 px-1.5 py-0.5 rounded">Pro</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 p-3 pt-6">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
            Workspace
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href.length > 5);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  active
                    ? "border-l-[3px] border-[#4338CA] bg-[#F1F1EF] text-[#111827] font-semibold"
                    : "text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#111827]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-colors ${active ? "text-[#4338CA]" : "text-[#9CA3AF] group-hover:text-[#111827]"}`} />
                  <span>{item.label}</span>
                </div>
                {active && <ChevronRight className="h-3.5 w-3.5 text-[#4338CA]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-[#F1F1EF] p-3 space-y-1">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#111827] ${
              pathname === "/profile" ? "bg-[#F1F1EF] text-[#111827]" : ""
            }`}
          >
            <UserIcon className="h-4 w-4 text-[#9CA3AF]" />
            <span>Profile</span>
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#111827] ${
              pathname === "/settings" ? "bg-[#F1F1EF] text-[#111827]" : ""
            }`}
          >
            <Settings className="h-4 w-4 text-[#9CA3AF]" />
            <span>Settings</span>
          </Link>

          {/* User Card */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#111827]">{user?.name || "Traveler"}</p>
                <p className="truncate text-[11px] text-[#6B7280]">{user?.email || "Signed in"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-white hover:text-[#DC2626] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#111827]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl z-50">
            <div className="flex h-20 items-center justify-between border-b border-[#F1F1EF] px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827] text-white">
                  <Plane className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-lg font-bold text-[#111827]">TripNest</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#6B7280] hover:bg-[#F1F1EF]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-[#F1F1EF] text-[#111827] font-semibold border-l-[3px] border-[#4338CA]" : "text-[#6B7280]"
                    }`}
                  >
                    <Icon className="h-4 w-4 text-[#4338CA]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[#F1F1EF] p-4">
              <button
                onClick={logout}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-screen lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-[#FAFAF9]/90 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#111827] shadow-xs lg:hidden"
                aria-label="Open navigation drawer"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#111827]">{pageTitle}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/trips/new"
                className="hidden sm:inline-flex items-center justify-center rounded-lg bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
              >
                + New Trip
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-full border border-[#E5E7EB] bg-white p-1.5 pr-3 text-xs font-medium text-[#111827] hover:border-[#D1D5DB] transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111827] text-[11px] font-bold text-white">
                  {initials}
                </div>
                <span className="hidden md:inline font-semibold">{user?.name || "Account"}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8 sm:px-10 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
