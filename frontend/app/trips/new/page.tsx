"use client";

import { Suspense, useEffect, useState } from "react";
import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useEffect, useState, useMemo, Suspense } from "react";
import { toast } from "sonner";
import { createTrip, getDestinations } from "../../../lib/api";
import type { Destination } from "../../../lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Plane,
  Search,
} from "lucide-react";

export default function NewTripPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-12 text-center text-xs font-semibold text-slate-500">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading Trip Planner...
          </div>
        </AppShell>
      }
    >
      <NewTripForm />
    </Suspense>
  );
}

function NewTripForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlDestinationId = searchParams.get("destinationId");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [step, setStep] = useState(1);

  // Destination Search & Filter State
  const [destSearchQuery, setDestSearchQuery] = useState("");
  const [destCategory, setDestCategory] = useState("All");

  // Form State
  const [destinationId, setDestinationId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelersCount, setTravelersCount] = useState(2);
  const [budget, setBudget] = useState("120000");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (urlDestinationId) {
      setDestinationId(urlDestinationId);
    }
  }, [urlDestinationId]);

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Unable to load destinations.";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setPageLoading(false));
  }, [preselectedDestId]);

  useEffect(() => {
    if (destinationId && destinations.length > 0) {
      const matched = destinations.find((d) => String(d.id) === String(destinationId));
      if (matched && (!title || title.endsWith("Vacation") || title.endsWith("Adventure"))) {
        setTitle(`${matched.name} Vacation`);
      }
    }
  }, [destinationId, destinations]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.category) set.add(d.category);
    });
    return ["All", ...Array.from(set)];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const query = destSearchQuery.toLowerCase().trim();
      const matchesCategory =
        destCategory === "All" ||
        (dest.category && dest.category.toLowerCase() === destCategory.toLowerCase());

      if (!matchesCategory) return false;
      if (!query) return true;

      const nameMatch = dest.name?.toLowerCase().includes(query) || false;
      const cityMatch = dest.city?.toLowerCase().includes(query) || false;
      const countryMatch = dest.country?.toLowerCase().includes(query) || false;
      const categoryMatch = dest.category?.toLowerCase().includes(query) || false;

      return nameMatch || cityMatch || countryMatch || categoryMatch;
    });
  }, [destinations, destSearchQuery, destCategory]);

  const selectedDestination = destinations.find((d) => String(d.id) === String(destinationId));

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!destinationId) {
        setError("Please select a destination to proceed.");
        return;
      }
      if (!title.trim() && selectedDestination) {
        setTitle(`${selectedDestination.name} Adventure`);
      }
    } else if (step === 2) {
      if (!startDate || !endDate) {
        setError("Please select both start and end dates.");
        return;
      }
      if (endDate < startDate) {
        setError("End date cannot be before start date.");
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const trip = await createTrip({
        title: title.trim() || `${selectedDestination?.name || "Travel"} Journey`,
        destinationId: Number(destinationId),
        startDate, // Format: YYYY-MM-DD from HTML5 date input
        endDate,   // Format: YYYY-MM-DD from HTML5 date input
        budget: budget ? Number(budget) : null,
        notes: notes.trim() ? notes.trim() : null,
      });

      toast.success("Trip created successfully.");
      if (trip && trip.id) {
        router.push(`/trips/${trip.id}`);
      } else {
        router.push("/trips");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to save your trip.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/trips"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to My Trips
          </Link>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">Interactive Trip Planner</h1>
              <p className="text-xs text-[#6B7280]">Design your custom itinerary step by step.</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#4338CA]">
              Step {step} of 5
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
            <div
              className="h-full bg-[#4338CA] transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* STEP 1: DESTINATION SELECTION */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div>
                <h2 className="text-xl font-extrabold text-[#111827]">Step 1: Where are you going?</h2>
                <p className="text-xs text-[#6B7280]">Search and select any destination to build your trip.</p>
              </div>

              {selectedDestination ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-extrabold text-emerald-800 border border-emerald-200 shadow-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Selected: {selectedDestination.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#3730A3] transition active:scale-95"
                  >
                    <span>Next: Select Dates</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
                  Please click any destination card below to select it.
                </div>
              )}
            </div>

            {/* Interactive Search & Filter Bar */}
            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search destination by name, city, country, or category..."
                  value={destSearchQuery}
                  onChange={(e) => setDestSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-xs"
                />
                {destSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDestSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              {categories.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">Categories:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDestCategory(cat)}
                      className={`rounded-lg px-3 py-1 text-[11px] font-bold transition ${
                        destCategory.toLowerCase() === cat.toLowerCase()
                          ? "bg-[#4338CA] text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {pageLoading ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-xs font-semibold text-[#6B7280]">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-[#4338CA] border-t-transparent" />
                Loading destinations catalog...
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                <MapPin className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="font-bold text-slate-800">No destinations found for "{destSearchQuery}"</p>
                <p className="mt-1 text-[11px]">Try clearing filters or searching another keyword.</p>
                <button
                  type="button"
                  onClick={() => {
                    setDestSearchQuery("");
                    setDestCategory("All");
                  }}
                  className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredDestinations.map((d) => {
                  const selected = String(d.id) === destinationId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setDestinationId(String(d.id));
                        setTitle(`${d.name} Vacation`);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${
                        selected
                          ? "border-2 border-[#4338CA] bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 relative">
                          <img
                            src={d.imageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80"}
                            alt={d.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#111827] truncate">{d.name}</h3>
                            {d.category && (
                              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 shrink-0">
                                {d.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] truncate mt-0.5">
                            📍 {d.city || d.country || "Global Location"}
                            {d.country && d.city ? `, ${d.country}` : ""}
                          </p>
                        </div>
                        {selected ? (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4338CA] text-white shadow-xs shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition shrink-0">
                            Select →
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                disabled={!destinationId}
                className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3] transition disabled:opacity-50"
              >
                <span>Next: Dates</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Floating Sticky Bottom Bar for Step 1 when destination is selected */}
            {selectedDestination && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-2xl bg-[#111827]/95 backdrop-blur-md px-6 py-3.5 text-white shadow-2xl border border-slate-700/50 animate-in fade-in slide-in-from-bottom-5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Destination Selected</p>
                    <p className="text-xs font-extrabold text-white">{selectedDestination.name}</p>
                  </div>
                </div>
                <div className="h-7 w-[1px] bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-5 py-2 text-xs font-bold text-white hover:bg-indigo-600 shadow-lg transition active:scale-95"
                >
                  <span>Next: Dates →</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: TRAVEL DATES */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Step 2: When are you traveling?</h2>
              <p className="text-xs text-[#6B7280]">Select start and end dates for your trip.</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Trip Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer in Paris"
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] py-3 px-4 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]"
              >
                <span>Next: Travelers</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TRAVELERS */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Step 3: Who is traveling?</h2>
              <p className="text-xs text-[#6B7280]">Select the number of travelers joining this journey.</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-2xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#4338CA] mb-4">
                <Users className="h-7 w-7" />
              </div>

              <div className="flex items-center justify-center gap-6 my-4">
                <button
                  type="button"
                  onClick={() => setTravelersCount((prev) => Math.max(1, prev - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FAFAF9] text-lg font-bold text-[#111827] hover:bg-white"
                >
                  -
                </button>
                <span className="text-3xl font-extrabold text-[#111827]">{travelersCount}</span>
                <button
                  type="button"
                  onClick={() => setTravelersCount((prev) => prev + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#FAFAF9] text-lg font-bold text-[#111827] hover:bg-white"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-[#6B7280]">
                {travelersCount === 1 ? "Solo Adventure" : `${travelersCount} Travelers Group`}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]"
              >
                <span>Next: Budget</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: BUDGET SLIDER */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Step 4: What is your total budget?</h2>
              <p className="text-xs text-[#6B7280]">Set an estimated spending limit in INR (₹).</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-2xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                <Wallet className="h-7 w-7" />
              </div>

              <div className="text-4xl font-extrabold text-[#111827] my-2">
                ₹{Number(budget || 0).toLocaleString("en-IN")}
              </div>

              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full max-w-md accent-[#4338CA] my-6"
              />

              <div className="flex justify-between text-xs text-[#6B7280] max-w-md mx-auto">
                <span>₹10,000</span>
                <span>₹2,50,000</span>
                <span>₹5,000,00+</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-[#3730A3]"
              >
                <span>Next: Final Summary</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: FINAL SUMMARY & SUBMISSION */}
        {step === 5 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Step 5: Review & Create Itinerary</h2>
              <p className="text-xs text-[#6B7280]">Review your selections and finalize your trip.</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F1EF] pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#111827]">{title}</h3>
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#4338CA]" /> {selectedDestination?.name}, {selectedDestination?.country}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Ready
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-[#6B7280]">
                <div>
                  <span className="font-bold text-[#111827] block">Dates</span>
                  <span>{startDate} – {endDate}</span>
                </div>
                <div>
                  <span className="font-bold text-[#111827] block">Travelers & Budget</span>
                  <span>{travelersCount} Travelers • ₹{Number(budget).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                  Trip Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Flight reminders, hotel confirmation codes, or packing notes..."
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#FAFAF9] p-3 text-xs text-[#111827] outline-none focus:border-[#4338CA] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-semibold text-[#6B7280]"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#4338CA] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#3730A3] transition disabled:opacity-50"
              >
                {loading ? (
                  <span>Creating Trip...</span>
                ) : (
                  <>
                    <span>Create Trip Itinerary</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
