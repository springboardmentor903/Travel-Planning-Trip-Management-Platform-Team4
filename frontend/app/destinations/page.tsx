"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getDestinations } from "../../lib/api";
import type { Destination } from "../../lib/types";
import MapView from "../../components/MapView";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const loadDestinations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDestinations();
      setDestinations(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to load destinations.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ["All", ...Array.from(set)];
  }, [destinations]);

  // Client-side search and category filtering
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesCategory =
        selectedCategory === "All" ||
        (dest.category && dest.category.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesCategory) return false;
      if (!query) return true;

      const nameMatch = dest.name?.toLowerCase().includes(query) || false;
      const cityMatch = dest.city?.toLowerCase().includes(query) || false;
      const countryMatch = dest.country?.toLowerCase().includes(query) || false;
      const locationMatch = dest.location?.toLowerCase().includes(query) || false;
      const categoryMatch = dest.category?.toLowerCase().includes(query) || false;

      return nameMatch || cityMatch || countryMatch || locationMatch || categoryMatch;
    });
  }, [destinations, searchQuery, selectedCategory]);

  const popularDestinations = useMemo(() => {
    return destinations.slice(0, 3);
  }, [destinations]);

  return (
    <AppShell>
      {/* Hero Catalog Banner Header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 p-6 sm:p-10 text-white shadow-xl shadow-indigo-950/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-2xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-200 backdrop-blur-md border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Global Catalog & Discovery
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-white">
            Destinations Catalog
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100/80 leading-relaxed">
            Explore curated locations worldwide, view live weather forecasts, explore interactive maps, and plan your next itinerary.
          </p>

          {/* Integrated Search Input Box */}
          <div className="mt-6 flex max-w-2xl items-center rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-inner">
            <span className="px-3 text-lg text-indigo-200">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination name, city, country, or category..."
              className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-indigo-200/70 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-3 rounded-lg px-2.5 py-1 text-xs font-bold text-indigo-200 hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Global World Map Card */}
      {!loading && destinations.length > 0 && (
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">🗺️ World Destinations Map</h2>
                <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-bold text-indigo-700">
                  Interactive Pins
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Pan and zoom to view curated locations across the globe. Click any marker to view details.
              </p>
            </div>
          </div>

          <MapView destinations={filteredDestinations} height="400px" zoom={2} />
        </div>
      )}

      {/* Popular Top Destinations Showcase */}
      {!loading && popularDestinations.length > 0 && !searchQuery && selectedCategory === "All" && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">🔥 Popular Destinations</h2>
            <span className="text-xs font-bold text-slate-400">Top recommendations for travelers</span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {popularDestinations.map((dest) => (
              <div
                key={dest.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={`/destinations/${dest.id}`} className="block h-48 w-full overflow-hidden">
                  {dest.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-95"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-700 to-purple-800 text-6xl">
                      🌴
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                </Link>
                <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-2 pointer-events-none">
                  <div className="pointer-events-auto">
                    {dest.category && (
                      <span className="inline-block rounded-full bg-indigo-600/90 backdrop-blur-md px-3 py-0.5 text-xs font-extrabold shadow-sm">
                        {dest.category}
                      </span>
                    )}
                    <Link href={`/destinations/${dest.id}`}>
                      <h3 className="mt-1.5 text-xl font-black text-white hover:text-indigo-200 transition-colors">{dest.name}</h3>
                    </Link>
                    <p className="mt-0.5 text-xs font-bold text-indigo-200 flex items-center gap-1">
                      <span>📍</span>
                      <span>{dest.city || dest.country ? `${dest.city || ""}${dest.city && dest.country ? ", " : ""}${dest.country || ""}` : "Global Location"}</span>
                    </p>
                  </div>
                  <Link
                    href={`/trips/new?destinationId=${dest.id}`}
                    className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold text-indigo-950 shadow-md hover:bg-white transition shrink-0"
                  >
                    + Plan Trip
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main All Destinations Grid Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900">All Catalog Destinations</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredDestinations.length} of {destinations.length} available world destinations
            </p>
          </div>

          {/* Dynamic Category Filter Tabs */}
          {!loading && categories.length > 1 && (
            <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100/80 p-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Display */}
        {loading ? (
          <SkeletonGrid />
        ) : filteredDestinations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              🔍
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">No destinations found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
              No destination matched "{searchQuery}". Try searching for another city, country, or category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((dest) => (
              <article
                key={dest.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    {dest.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-5xl">
                        🌍
                      </div>
                    )}
                    {dest.category && (
                      <span className="absolute top-3.5 left-3.5 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-indigo-700 shadow-sm">
                        {dest.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {dest.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                      <span>📍</span>
                      <span className="truncate">
                        {dest.city || dest.location || dest.country || "Global Location"}
                        {dest.country && dest.city ? `, ${dest.country}` : ""}
                      </span>
                    </p>
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {dest.description || "No detailed description provided for this destination."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
                  <Link
                    href={`/destinations/${dest.id}`}
                    className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800 transition"
                  >
                    View Details <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>

                  <Link
                    href={`/trips/new?destinationId=${dest.id}`}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                  >
                    + Plan Trip
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white p-4">
          <div className="h-44 rounded-2xl bg-slate-200" />
          <div className="mt-4 h-6 w-3/4 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-1/2 rounded-lg bg-slate-100" />
          <div className="mt-4 flex gap-2">
            <div className="h-8 w-24 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
