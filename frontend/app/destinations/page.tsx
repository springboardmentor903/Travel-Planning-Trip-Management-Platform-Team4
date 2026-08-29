"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDestinations } from "../../lib/api";
import type { Destination } from "../../lib/types";

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
      setDestinations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load destinations from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  // Extract unique categories from real backend destinations data
  const categories = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ["All", ...Array.from(set)];
  }, [destinations]);

  // Client-side filtering matching search query (Name, City, Country, Category)
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

  // Popular destinations showcase (curated selection of existing destinations)
  const popularDestinations = useMemo(() => {
    return destinations.slice(0, 3);
  }, [destinations]);

  return (
    <AppShell>
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-7 text-white shadow-xl shadow-indigo-100 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">Explore the World</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Destinations Catalog</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
          Browse curated destinations loaded directly from the TripNest database. Select a destination to view details or plan a trip.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex max-w-xl items-center rounded-2xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20">
          <span className="px-3 text-lg">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by destination name, city, country, or category…"
            className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-indigo-200 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mr-2 text-xs font-bold text-indigo-200 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Global Error Banner */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Popular Destinations Section */}
      {!loading && popularDestinations.length > 0 && !searchQuery && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">🔥 Popular Destinations</h2>
            <span className="text-xs font-semibold text-slate-500">Top picks for your next trip</span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {popularDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-44 w-full">
                  {dest.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="h-full w-full object-cover opacity-85 transition duration-300 group-hover:scale-105 group-hover:opacity-95"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-indigo-900 text-5xl">🌍</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  {dest.category && (
                    <span className="rounded-full bg-indigo-600/80 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold">
                      {dest.category}
                    </span>
                  )}
                  <h3 className="mt-1 text-lg font-extrabold">{dest.name}</h3>
                  <p className="text-xs text-indigo-200">
                    📍 {dest.city || dest.country ? `${dest.city || ""}${dest.city && dest.country ? ", " : ""}${dest.country || ""}` : "Global Location"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Destinations Catalog */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">All Destinations</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredDestinations.length} of {destinations.length} destinations
            </p>
          </div>

          {/* Category Filter Pills */}
          {!loading && categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          <div className="mt-8 rounded-xl bg-slate-50 p-12 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading destinations from backend…
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              🔍
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">No destinations found</h3>
            <p className="mt-1 text-sm text-slate-500">
              No results matched your search term "{searchQuery}". Try searching for another city, country, or category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((dest) => (
              <article
                key={dest.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    {dest.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-indigo-50 text-5xl">🌍</div>
                    )}
                    {dest.category && (
                      <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-extrabold text-indigo-700 shadow-sm">
                        {dest.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-slate-900">{dest.name}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
                      📍 {dest.city || dest.location || dest.country || "Global Location"}
                      {dest.country && dest.city ? `, ${dest.country}` : ""}
                    </p>
                    <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {dest.description || "No detailed description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-4">
                  <Link
                    href={`/destinations/${dest.id}`}
                    className="rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    View Details →
                  </Link>
                  <Link
                    href={`/trips/new?destinationId=${dest.id}`}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    + Plan Trip
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
