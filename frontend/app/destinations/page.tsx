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

  // Category options
  const categoryList = ["All", "Beach", "Nature", "Adventure", "Culture", "City", "Luxury"];

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

  return (
    <AppShell>
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-indigo-100 sm:p-11">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold text-white backdrop-blur-md">
            Destination Discovery
          </span>
          <span className="text-xs font-bold text-indigo-200">•</span>
          <span className="text-xs font-semibold text-indigo-100">Explore. Plan. Experience.</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">Explore Popular Destinations</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base">
          Discover breathtaking locations worldwide, check live weather forecasts, explore top attractions, and launch your next trip itinerary seamlessly.
        </p>

        {/* Search Input Bar */}
        <div className="mt-7 flex max-w-2xl items-center rounded-2xl border border-white/25 bg-white/15 p-2 shadow-lg backdrop-blur-md">
          <span className="px-3 text-lg">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, country, or destination name (e.g. Goa, Tokyo, Paris)..."
            className="w-full bg-transparent px-2 py-2.5 text-sm font-medium text-white placeholder-indigo-200 outline-none"
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
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Destinations Catalog & Category Filters */}
      <section className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Explore Catalog</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {filteredDestinations.length} of {destinations.length} available destinations
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categoryList.map((cat) => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition duration-200 ${
                    active
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="mt-8 rounded-2xl bg-slate-50 p-12 text-center text-xs font-bold text-slate-500">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading destination catalogue from backend…
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl">
              🔍
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-slate-900">No destinations found</h3>
            <p className="mt-1 text-xs text-slate-500">
              No results matched your search "{searchQuery}". Try searching for another city or resetting category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDestinations.map((dest) => (
              <article
                key={dest.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    {dest.imageUrl ? (
                      <img
                        src={dest.imageUrl}
                        alt={dest.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-tr from-indigo-500 to-violet-600 text-5xl text-white">
                        🗺️
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                        Popular
                      </span>
                      {dest.category && (
                        <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-extrabold text-slate-900 shadow-sm">
                          {dest.category}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-xl font-extrabold drop-shadow-xs">{dest.name}</h3>
                      <p className="text-xs font-bold text-indigo-200">
                        📍 {dest.city || dest.country}{dest.city && dest.country ? `, ${dest.country}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {dest.description || "Explore breathtaking landmarks, local culinary scenes, and rich cultural heritage."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 p-4">
                  <Link
                    href={`/destinations/${dest.id}`}
                    className="flex-1 rounded-xl bg-indigo-50 py-2.5 text-center text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-600 hover:text-white"
                  >
                    Explore Destination →
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
