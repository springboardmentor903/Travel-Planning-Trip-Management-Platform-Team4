"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createTrip, getDestinations } from "../../../lib/api";
import type { Destination } from "../../../lib/types";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function NewTripPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [step, setStep] = useState(1);

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
    getDestinations()
      .then(setDestinations)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load destinations."))
      .finally(() => setPageLoading(false));
  }, []);

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
        startDate,
        endDate,
        budget: budget ? Number(budget) : null,
        notes: notes.trim() ? notes.trim() : null,
      });

      if (trip && trip.id) {
        router.push(`/trips/${trip.id}`);
      } else {
        router.push("/trips");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create trip. Please try again.");
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
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Step 1: Where are you going?</h2>
              <p className="text-xs text-[#6B7280]">Select your dream destination from our catalog.</p>
            </div>

            {pageLoading ? (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-12 text-center text-xs font-semibold text-[#6B7280]">
                Loading destinations...
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {destinations.map((d) => {
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
                          ? "border-2 border-[#4338CA] bg-indigo-50/40 shadow-xs"
                          : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <img
                            src={d.imageUrl || "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=300&q=80"}
                            alt={d.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm text-[#111827]">{d.name}</h3>
                          <p className="text-xs text-[#6B7280]">{d.country || d.city || "Location"}</p>
                        </div>
                        {selected && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4338CA] text-white">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
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
