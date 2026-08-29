"use client";

import { useEffect, useState } from "react";
import type { CreateItineraryDayRequest, ItineraryDay, Trip } from "../../lib/types";
import { createItinerary, deleteItinerary, getItineraries, updateItinerary } from "../../lib/api";
import ItineraryDayCard from "./ItineraryDayCard";
import ItineraryDayModal from "./ItineraryDayModal";

export default function ItinerarySection({ trip }: { trip: Trip }) {
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [dayModalOpen, setDayModalOpen] = useState(false);
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
      throw err; // Handled inside modal to show inline form error
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

        <button
          onClick={() => {
            setEditingDay(null);
            setDayModalOpen(true);
          }}
          className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
        >
          + Add Day
        </button>
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
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-2xl">
              📅
            </div>
            <h3 className="mt-3 text-base font-extrabold text-slate-900">No itinerary days yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Build your schedule day-by-day by adding itinerary days and activities.
            </p>
            <button
              onClick={() => {
                setEditingDay(null);
                setDayModalOpen(true);
              }}
              className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
            >
              + Add Day 1
            </button>
          </div>
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
