"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getDestinations, getTrips } from "../lib/api";
import type { Destination, Trip, User } from "../lib/types";
import {
  Compass,
  FilePlus,
  Home,
  LogOut,
  MapPin,
  Bell,
  Search,
  ShieldAlert,
  User as UserIcon,
  Luggage,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CommandPalette({ open: externalOpen, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Dynamic API search results
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [searching, setSearching] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const setOpen = (val: boolean) => {
    setInternalOpen(val);
    if (onOpenChange) onOpenChange(val);
  };

  // Keyboard shortcut handler (Ctrl+K and Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Read current user profile
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, [open]);

  // Dynamic API Search on user query change
  useEffect(() => {
    if (!open || !query.trim()) {
      setDestinations([]);
      setTrips([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const [destData, tripData] = await Promise.all([
          getDestinations().catch(() => []),
          getTrips().catch(() => []),
        ]);

        const q = query.toLowerCase().trim();
        const matchedDests = (destData || []).filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            (d.city && d.city.toLowerCase().includes(q)) ||
            (d.country && d.country.toLowerCase().includes(q))
        );

        const matchedTrips = (tripData || []).filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.destination?.name && t.destination.name.toLowerCase().includes(q))
        );

        setDestinations(matchedDests.slice(0, 5));
        setTrips(matchedTrips.slice(0, 5));
      } catch {
        // Silently ignore search error in palette
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, open]);

  // Admin Check: Only display admin command if user has ADMINISTRATOR role
  const isAdmin =
    currentUser?.role === "ADMINISTRATOR" ||
    currentUser?.role === "ROLE_ADMINISTRATOR" ||
    currentUser?.role?.includes("ADMIN");

  const runCommand = (action: () => void) => {
    setOpen(false);
    setQuery("");
    action();
  };

  const logout = () => {
    runCommand(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      toast.success("Signed out successfully.");
      router.replace("/login");
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl transition-all">
        <Command label="Global Command Palette" className="w-full">
          {/* Search Input Bar */}
          <div className="flex items-center border-b border-slate-100 px-4 py-3.5">
            <Search className="mr-3 h-4 w-4 shrink-0 text-indigo-600" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Type a command or search trips & destinations... (Ctrl+K)"
              className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-extrabold text-slate-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="p-8 text-center text-xs font-semibold text-slate-500">
              {searching ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  Searching destinations & trips...
                </div>
              ) : (
                "No matching commands, trips, or destinations found."
              )}
            </Command.Empty>

            {/* Dynamic Search Results */}
            {trips.length > 0 && (
              <Command.Group heading="Trips Results" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {trips.map((trip) => (
                  <Command.Item
                    key={`trip-${trip.id}`}
                    onSelect={() => runCommand(() => router.push(`/trips/${trip.id}`))}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Luggage className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{trip.title}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">{trip.destination?.name || "Trip"}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {destinations.length > 0 && (
              <Command.Group heading="Destinations Results" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {destinations.map((dest) => (
                  <Command.Item
                    key={`dest-${dest.id}`}
                    onSelect={() => runCommand(() => router.push(`/destinations/${dest.id}`))}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="h-4 w-4 text-indigo-600 shrink-0" />
                      <span className="truncate">{dest.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase">{dest.country || dest.city || "Catalog"}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          runCommand(() => router.push(`/trips/new?destinationId=${dest.id}`));
                        }}
                        className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[10px] font-extrabold text-white hover:bg-indigo-700 transition"
                      >
                        + Plan Trip
                      </button>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Navigation Commands */}
            <Command.Group heading="Navigation" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <Home className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Go to Dashboard</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/destinations"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <Compass className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Go to Destinations</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/trips"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <Luggage className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Go to Trips</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/trips/new"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <FilePlus className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Create New Trip</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/notifications"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Go to Notifications</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => router.push("/settings"))}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-900 aria-selected:bg-indigo-50 aria-selected:text-indigo-900"
              >
                <UserIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Go to Profile & Settings</span>
              </Command.Item>

              {/* SECURITY: Admin commands ONLY displayed for ADMINISTRATOR role */}
              {isAdmin && (
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/admin/dashboard"))}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-purple-700 bg-purple-50/50 hover:bg-purple-100 aria-selected:bg-purple-100"
                >
                  <ShieldAlert className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Go to Admin Dashboard</span>
                </Command.Item>
              )}
            </Command.Group>

            <Command.Group heading="Account" className="px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-t border-slate-100 mt-2">
              <Command.Item
                onSelect={logout}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 aria-selected:bg-red-50"
              >
                <LogOut className="h-4 w-4 text-red-600 shrink-0" />
                <span>Logout</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-[11px] font-semibold text-slate-400">
            <span>
              Press <kbd className="rounded border bg-white px-1 font-mono text-[10px]">Ctrl</kbd> + <kbd className="rounded border bg-white px-1 font-mono text-[10px]">K</kbd> to toggle
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-extrabold text-slate-500 hover:text-slate-800"
            >
              Close ✕
            </button>
          </div>
        </Command>
      </div>
    </div>
  );
}
