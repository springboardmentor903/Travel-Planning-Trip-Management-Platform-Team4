"use client";

import AppShell from "../../components/AppShell";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDestinations } from "../../lib/api";
import type { Destination } from "../../lib/types";
import { Search, MapPin, Compass, ArrowRight, Heart, Sparkles } from "lucide-react";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);

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

  const categoryList = ["All", "Beach", "Nature", "Adventure", "Culture", "City", "Luxury"];

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

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <AppShell>
      {/* HEADER HERO */}
      <div className="mb-10 rounded-3xl bg-[#111827] p-8 text-white shadow-xl sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"
            alt="Destinations Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md mb-4 border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            <span>Curated Travel Spots</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Explore Destinations</h1>
          <p className="mt-3 text-sm text-white/80 leading-relaxed">
            Discover breathtaking locations worldwide, inspect live weather forecasts, and create customized itineraries.
          </p>

          {/* SEARCH INPUT */}
          <div className="mt-6 flex items-center rounded-2xl border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-md">
            <Search className="ml-3 h-5 w-5 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, country, or spot name..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-white placeholder-white/60 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mr-3 text-xs font-bold text-white/80 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* FILTER CATEGORIES & CATALOG */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#111827]">All Destinations</h2>
            <p className="text-xs text-[#6B7280]">
              Showing {filteredDestinations.length} of {destinations.length} places
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
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-[#111827] text-white shadow-2xs"
                      : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#FAFAF9] hover:text-[#111827]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* CATALOG GRID */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="h-48 w-full rounded-xl bg-slate-200 mb-3" />
                <div className="h-5 w-2/3 rounded bg-slate-200 mb-2" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
            <Compass className="mx-auto h-10 w-10 text-[#9CA3AF] mb-3" />
            <h3 className="text-base font-extrabold text-[#111827]">No destinations found</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Try searching for a different city or category.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-xl bg-[#4338CA] px-4 py-2 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDestinations.map((dest) => (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className="group relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xs hover:shadow-xl hover:border-[#D1D5DB] transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={
                        dest.imageUrl ||
                        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/70 via-transparent to-transparent" />

                    <button
                      onClick={(e) => toggleFavorite(dest.id, e)}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs text-[#111827] hover:bg-white"
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(dest.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-lg font-bold">{dest.name}</h3>
                      <p className="text-xs text-white/80 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-indigo-400" /> {dest.city || dest.country || "Explore"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
                      {dest.description || "Discover local attractions, culture, and live weather conditions."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#F1F1EF] p-4 text-xs font-semibold text-[#4338CA]">
                  <span>Explore Destination</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
