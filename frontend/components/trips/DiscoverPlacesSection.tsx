"use client";

import { useEffect, useState } from "react";
import type { Trip, ItineraryDay, RecommendedPlace } from "../../lib/types";
import { getDestinationRecommendations, createActivity, createItinerary } from "../../lib/api";
import { Search, Flame, Landmark, Trees, Utensils, ShoppingBag, Sparkles, MapPin, Clock, DollarSign, Plus, Eye, X, Check, Filter } from "lucide-react";
import { motion } from "framer-motion";

const TABS = [
  { id: "Must Visit", label: "Must Visit", icon: Flame, color: "text-amber-500 bg-amber-50" },
  { id: "Culture", label: "Culture", icon: Landmark, color: "text-indigo-600 bg-indigo-50" },
  { id: "Nature", label: "Nature", icon: Trees, color: "text-emerald-600 bg-emerald-50" },
  { id: "Food", label: "Food", icon: Utensils, color: "text-rose-600 bg-rose-50" },
  { id: "Shopping", label: "Shopping", icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
  { id: "Hidden Gems", label: "Hidden Gems", icon: Sparkles, color: "text-purple-600 bg-purple-50" },
];

const FALLBACK_IMAGES: Record<string, string> = {
  "Must Visit": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80",
  "Culture": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80",
  "Nature": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
  "Food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80",
  "Shopping": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
  "Hidden Gems": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=600&auto=format&fit=crop&q=80",
};

export default function DiscoverPlacesSection({
  trip,
  days,
  onActivityAdded,
}: {
  trip: Trip;
  days: ItineraryDay[];
  onActivityAdded: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allPlaces, setAllPlaces] = useState<RecommendedPlace[]>([]);
  const [activeTab, setActiveTab] = useState<string>("Must Visit");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [costFilter, setCostFilter] = useState<"ALL" | "FREE" | "PAID">("ALL");
  const [popularityFilter, setPopularityFilter] = useState<"ALL" | "HIGH">("ALL");

  // Modals
  const [detailsPlace, setDetailsPlace] = useState<RecommendedPlace | null>(null);
  const [addPlace, setAddPlace] = useState<RecommendedPlace | null>(null);

  // Add to Day Form State
  const [targetDayNumber, setTargetDayNumber] = useState<number>(1);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const loadRecommendations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDestinationRecommendations(trip.id);
      if (res && res.allRecommendations) {
        setAllPlaces(res.allRecommendations);
      } else {
        setAllPlaces([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load destination places.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [trip.id]);

  // Handle opening "+ Add to Day" modal
  const openAddModal = (place: RecommendedPlace) => {
    setAddPlace(place);
    setCustomName(place.name);
    setCustomDescription(place.description);
    setTargetDayNumber(days.length > 0 ? days[0].dayNumber : 1);
    setStartTime("10:00");
    setEndTime("12:00");
    setAddError("");
  };

  // Perform saving activity to selected day
  const handleSaveActivityToDay = async () => {
    if (!addPlace) return;
    setSaving(true);
    setAddError("");

    try {
      // 1. Check if target day exists, else create it
      let targetDay = days.find((d) => d.dayNumber === targetDayNumber);
      if (!targetDay) {
        const startDateObj = trip.startDate ? new Date(trip.startDate) : new Date();
        startDateObj.setDate(startDateObj.getDate() + (targetDayNumber - 1));
        const dateStr = startDateObj.toISOString().split("T")[0];

        targetDay = await createItinerary(trip.id, {
          dayNumber: targetDayNumber,
          title: `Day ${targetDayNumber}`,
          description: `Activities for Day ${targetDayNumber}`,
          date: dateStr,
        });
      }

      // 2. Format Start & End LocalDateTime strings
      const baseDate = targetDay.date ? targetDay.date : trip.startDate;
      const startDateTimeStr = `${baseDate}T${startTime.length === 5 ? startTime + ":00" : startTime}`;
      const endDateTimeStr = `${baseDate}T${endTime.length === 5 ? endTime + ":00" : endTime}`;

      // 3. Create Activity
      await createActivity(targetDay.id, {
        name: customName || addPlace.name,
        description: customDescription || addPlace.description,
        location: addPlace.location || trip.destination?.name || "Local Spot",
        startTime: startDateTimeStr,
        endTime: endDateTimeStr,
      });

      setAddPlace(null);
      onActivityAdded();
    } catch (err: any) {
      setAddError(err?.message || "Failed to add place to itinerary.");
    } finally {
      setSaving(false);
    }
  };

  // Filter places based on Tab + Search + Filters
  const filteredPlaces = allPlaces.filter((place) => {
    // Category mapping logic
    const categoryLower = (place.category || "").toLowerCase();

    let matchesTab = false;
    if (activeTab === "Must Visit") {
      matchesTab = categoryLower.includes("must") || categoryLower.includes("landmark") || place.popularity?.toLowerCase() === "high";
    } else if (activeTab === "Culture") {
      matchesTab = categoryLower.includes("culture") || categoryLower.includes("historic") || categoryLower.includes("museum");
    } else if (activeTab === "Nature") {
      matchesTab = categoryLower.includes("nature") || categoryLower.includes("scenic") || categoryLower.includes("beach") || categoryLower.includes("park");
    } else if (activeTab === "Food") {
      matchesTab = categoryLower.includes("food") || categoryLower.includes("restaurant") || categoryLower.includes("cafe") || categoryLower.includes("culinary");
    } else if (activeTab === "Shopping") {
      matchesTab = categoryLower.includes("shop") || categoryLower.includes("market") || categoryLower.includes("bazaar");
    } else if (activeTab === "Hidden Gems") {
      matchesTab = categoryLower.includes("hidden") || categoryLower.includes("gem") || categoryLower.includes("local");
    }

    if (!matchesTab) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = place.name.toLowerCase().includes(q);
      const descMatch = place.description.toLowerCase().includes(q);
      const locMatch = (place.location || "").toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !locMatch) return false;
    }

    // Cost filter
    if (costFilter === "FREE") {
      const costStr = (place.estimatedCost || "").toLowerCase();
      if (!costStr.includes("free") && !costStr.includes("€0") && !costStr.includes("₹0") && !costStr.includes("$0")) {
        return false;
      }
    } else if (costFilter === "PAID") {
      const costStr = (place.estimatedCost || "").toLowerCase();
      if (costStr.includes("free") || costStr.includes("€0") || costStr.includes("₹0") || costStr.includes("$0")) {
        return false;
      }
    }

    // Popularity filter
    if (popularityFilter === "HIGH") {
      if ((place.popularity || "").toLowerCase() !== "high") return false;
    }

    return true;
  });

  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900">
              Discover Places in {trip.destination?.name || "Destination"}
            </h3>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {allPlaces.length} Places
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Explore famous landmarks, restaurants, and hidden spots to add directly to your itinerary.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search places or activities…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Category Tabs & Filters */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Category Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                  active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-500"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Additional Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-slate-500">Quick Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Price Filter */}
            <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200">
              <button
                onClick={() => setCostFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  costFilter === "ALL" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Costs
              </button>
              <button
                onClick={() => setCostFilter("FREE")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  costFilter === "FREE" ? "bg-emerald-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Free Only
              </button>
              <button
                onClick={() => setCostFilter("PAID")}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  costFilter === "PAID" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid
              </button>
            </div>

            {/* Popularity Filter */}
            <button
              onClick={() => setPopularityFilter(popularityFilter === "HIGH" ? "ALL" : "HIGH")}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold transition border ${
                popularityFilter === "HIGH"
                  ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>High Popularity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Place Cards Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-12 text-center text-xs font-semibold text-slate-500">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Discovering famous places in {trip.destination?.name || "destination"}…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            {error}
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">No places found matching your filters</h4>
            <p className="text-[11px] text-slate-500 mt-1">Try resetting search or category tab filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place, idx) => {
              const placeImg = place.imageUrl || FALLBACK_IMAGES[activeTab] || FALLBACK_IMAGES["Must Visit"];

              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition group"
                >
                  {/* Place Image Container */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={placeImg}
                      alt={place.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-extrabold text-white">
                        {place.category}
                      </span>
                      {place.popularity?.toLowerCase() === "high" && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-xs">
                          <Flame className="h-3 w-3" />
                          High Popularity
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-sm font-extrabold text-white drop-shadow-md truncate">
                        {place.name}
                      </h4>
                    </div>
                  </div>

                  {/* Place Info Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                        {place.description}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-2.5">
                        {place.estimatedDuration && (
                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{place.estimatedDuration}</span>
                          </div>
                        )}
                        {place.estimatedCost && (
                          <div className="flex items-center gap-1 text-emerald-600 font-extrabold truncate">
                            <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{place.estimatedCost}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <button
                        onClick={() => setDetailsPlace(place)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        onClick={() => openAddModal(place)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add to Day</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Place Details Modal */}
      {detailsPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
            {/* Header Image */}
            <div className="relative h-48 w-full bg-slate-100">
              <img
                src={detailsPlace.imageUrl || FALLBACK_IMAGES[activeTab] || FALLBACK_IMAGES["Must Visit"]}
                alt={detailsPlace.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setDetailsPlace(null)}
                className="absolute top-4 right-4 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider">
                  {detailsPlace.category}
                </span>
                <h3 className="mt-1 text-lg font-extrabold text-white drop-shadow-md">{detailsPlace.name}</h3>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs leading-relaxed text-slate-600 font-medium">{detailsPlace.description}</p>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Visit Duration</span>
                  <strong className="text-slate-800 font-extrabold">{detailsPlace.estimatedDuration || "1 - 2 hours"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Best Time</span>
                  <strong className="text-slate-800 font-extrabold">{detailsPlace.recommendedTime || "Morning / Afternoon"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimated Cost</span>
                  <strong className="text-emerald-700 font-extrabold">{detailsPlace.estimatedCost || "Free"}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Location</span>
                  <strong className="text-slate-800 font-extrabold truncate block">{detailsPlace.location || trip.destination?.name}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDetailsPlace(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const place = detailsPlace;
                    setDetailsPlace(null);
                    openAddModal(place);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Itinerary Day</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "+ Add Place to Day" Form Modal */}
      {addPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Add Place to Itinerary Day</h3>
                <p className="text-xs text-slate-500">Scheduled activity for <span className="font-bold text-slate-800">{addPlace.name}</span></p>
              </div>
              <button onClick={() => setAddPlace(null)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {addError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {addError}
              </div>
            )}

            <div className="space-y-4">
              {/* Day Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Day
                </label>
                <select
                  value={targetDayNumber}
                  onChange={(e) => setTargetDayNumber(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {days.length > 0 ? (
                    days.map((d) => (
                      <option key={d.id} value={d.dayNumber}>
                        Day {d.dayNumber}: {d.title} ({d.date || `Day ${d.dayNumber}`})
                      </option>
                    ))
                  ) : (
                    <option value={1}>Day 1 (Will create Day 1 automatically)</option>
                  )}
                </select>
              </div>

              {/* Start & End Time Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Activity Custom Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Activity Custom Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                disabled={saving}
                onClick={() => setAddPlace(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSaveActivityToDay}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{saving ? "Saving Activity…" : "Add to Itinerary"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
