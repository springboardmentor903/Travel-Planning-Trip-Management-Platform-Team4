"use client";

import { useEffect, useState } from "react";
import type { CreateItineraryDayRequest, ItineraryDay, Trip } from "../../lib/types";
import { createItinerary, deleteItinerary, getItineraries, updateItinerary } from "../../lib/api";
import ItineraryDayCard from "./ItineraryDayCard";
import ItineraryDayModal from "./ItineraryDayModal";
import SmartItineraryModal from "./SmartItineraryModal";
import DiscoverPlacesSection from "./DiscoverPlacesSection";
import SmartTripInsights from "./SmartTripInsights";
import { Sparkles, Calendar, Plus, Edit3, MapPin, Utensils, Mountain, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ItinerarySection({ trip }: { trip: Trip }) {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [smartModalOpen, setSmartModalOpen] = useState(false);
  const [editingDay, setEditingDay] = useState<ItineraryDay | null>(null);
  const [isSavingDay, setIsSavingDay] = useState(false);

  const [deletingDay, setDeletingDay] = useState<ItineraryDay | null>(null);
  const [isDeletingDay, setIsDeletingDay] = useState(false);

  const loadItineraryDays = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItineraries(trip.id);
      setDays(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load itinerary days.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItineraryDays();
  }, [trip.id]);

  const handleSaveDay = async (requestData: CreateItineraryDayRequest) => {
    setIsSavingDay(true);
    setNotification(null);
    try {
      if (editingDay) {
        await updateItinerary(editingDay.id, requestData);
        setNotification({ type: "success", message: `Day ${requestData.dayNumber} updated successfully.` });
      } else {
        await createItinerary(trip.id, requestData);
        setNotification({ type: "success", message: `Day ${requestData.dayNumber} added to trip itinerary.` });
      }
      setDayModalOpen(false);
      setEditingDay(null);
      await loadItineraryDays();
    } catch (err) {
      throw err; // Handled inside modal
    } finally {
      setIsSavingDay(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!deletingDay) return;
    setIsDeletingDay(true);
    setNotification(null);
    try {
      await deleteItinerary(deletingDay.id);
      setNotification({ type: "success", message: `Day ${deletingDay.dayNumber} removed.` });
      setDeletingDay(null);
      await loadItineraryDays();
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete itinerary day.",
      });
    } finally {
      setIsDeletingDay(false);
    }
  };

  const suggestedNextDayNumber = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Trip Itinerary</h2>
            {!loading && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {days.length} Day{days.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Day-by-day plan and activities for {trip.title}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSmartModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Smart Suggestions</span>
          </button>
          <button
            onClick={() => {
              setEditingDay(null);
              setDayModalOpen(true);
            }}
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Day</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`mt-6 flex items-center justify-between rounded-xl border p-4 text-sm font-semibold ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-xs font-bold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Smart Trip Insights Panel */}
      <div className="mt-6">
        <SmartTripInsights trip={trip} days={days} />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Day List */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading trip itinerary…
          </div>
        ) : days.length === 0 ? (
          /* Redesigned Empty State */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 p-6 sm:p-10 text-center shadow-xs"
          >
            {/* Header Section */}
            <div className="max-w-xl mx-auto">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Plan Your Perfect Trip
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                Start planning manually or let TripNest suggest a personalized itinerary based on your destination and travel style.
              </p>
            </div>

            {/* Action Cards Grid */}
            <div className="mt-8 grid gap-5 max-w-2xl mx-auto sm:grid-cols-2">
              {/* CARD 1: Manual Planning */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition text-left group"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 mb-4 group-hover:bg-slate-900 group-hover:text-white transition">
                    <Edit3 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900">Manual Planning</h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                    Build your trip day by day and add activities manually.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDay(null);
                    setDayModalOpen(true);
                  }}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs font-bold text-slate-800 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>

              {/* CARD 2: Smart Suggestions (Recommended) */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-500/80 bg-gradient-to-b from-indigo-50/70 via-white to-white p-6 shadow-md shadow-indigo-100/50 hover:border-indigo-600 hover:shadow-lg transition text-left group"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-extrabold text-white shadow-xs tracking-wider uppercase">
                    Recommended
                  </span>
                </div>
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-4 shadow-md shadow-indigo-200 group-hover:scale-105 transition">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    Smart Suggestions
                  </h4>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-medium">
                    Get personalized places, activities, and a suggested day-by-day itinerary.
                  </p>
                </div>
                <button
                  onClick={() => setSmartModalOpen(true)}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 px-4 text-xs font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Generate Suggestions</span>
                </button>
              </motion.div>
            </div>

            {/* What You'll Get Section */}
            <div className="mt-10 border-t border-slate-200/60 pt-6 max-w-2xl mx-auto">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-4">
                What you'll get
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>📍</span>
                  <span>Famous places to visit</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>🗓️</span>
                  <span>Day-by-day itinerary ideas</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>🍽️</span>
                  <span>Food recommendations</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>🌄</span>
                  <span>Hidden gems</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
                  <span>💰</span>
                  <span>Budget-aware suggestions</span>
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => (
              <ItineraryDayCard
                key={day.id}
                day={day}
                onEditDay={(d) => {
                  setEditingDay(d);
                  setDayModalOpen(true);
                }}
                onDeleteDay={(d) => setDeletingDay(d)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Day Modal */}
      <ItineraryDayModal
        isOpen={dayModalOpen}
        initialData={editingDay}
        suggestedNextDayNumber={suggestedNextDayNumber}
        trip={trip}
        onSave={handleSaveDay}
        onClose={() => {
          setDayModalOpen(false);
          setEditingDay(null);
        }}
        isSaving={isSavingDay}
      />

      {/* Smart Itinerary Modal */}
      <SmartItineraryModal
        isOpen={smartModalOpen}
        trip={trip}
        onClose={() => setSmartModalOpen(false)}
        onApplied={() => {
          loadItineraryDays();
          setNotification({ type: "success", message: "Smart itinerary applied successfully!" });
        }}
      />

      {/* Discover Places Section */}
      <DiscoverPlacesSection
        trip={trip}
        days={days}
        onActivityAdded={() => {
          loadItineraryDays();
          setNotification({ type: "success", message: "Place added to itinerary day successfully!" });
        }}
      />

      {/* Delete Day Confirmation Modal */}
      {deletingDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900">Delete Itinerary Day</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Are you sure you want to delete <span className="font-bold text-slate-900">Day {deletingDay.dayNumber}: "{deletingDay.title}"</span>? All activities scheduled for this day will also be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isDeletingDay}
                onClick={() => setDeletingDay(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingDay}
                onClick={handleDeleteDay}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingDay ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
