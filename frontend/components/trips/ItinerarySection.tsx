"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateActivityRequest, CreateItineraryDayRequest, ItineraryDay, PlaceInfo, Trip } from "../../lib/types";
import { createActivity, createItinerary, deleteItinerary, getDestinationPlaces, getItineraries, updateItinerary } from "../../lib/api";
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

  // Relevant Attractions state from OpenStreetMap + Overpass API
  const [attractions, setAttractions] = useState<PlaceInfo[]>([]);
  const [attractionsLoading, setAttractionsLoading] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<PlaceInfo | null>(null);
  const [targetDayId, setTargetDayId] = useState<number | "NEW" | "">("");
  const [activityTime, setActivityTime] = useState("10:00");
  const [isAddingAttraction, setIsAddingAttraction] = useState(false);

  const loadItineraryDays = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItineraries(trip.id);
      setDays(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load itinerary days.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadAttractions = async () => {
    if (!trip.destination?.id) return;
    setAttractionsLoading(true);
    try {
      const data = await getDestinationPlaces(trip.destination.id);
      setAttractions(data || []);
    } catch {
      // Ignore attraction load failure in itinerary
    } finally {
      setAttractionsLoading(false);
    }
  };

  useEffect(() => {
    loadItineraryDays();
    loadAttractions();
  }, [trip.id, trip.destination?.id]);

  const handleSaveDay = async (requestData: CreateItineraryDayRequest) => {
    setIsSavingDay(true);
    try {
      if (editingDay) {
        await updateItinerary(editingDay.id, requestData);
        toast.success(`Day ${requestData.dayNumber} updated successfully.`);
      } else {
        await createItinerary(trip.id, requestData);
        toast.success("Itinerary generated.");
      }
      setDayModalOpen(false);
      setEditingDay(null);
      await loadItineraryDays();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save itinerary day.");
      throw err;
    } finally {
      setIsSavingDay(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!deletingDay) return;
    setIsDeletingDay(true);
    try {
      await deleteItinerary(deletingDay.id);
      toast.success(`Day ${deletingDay.dayNumber} removed.`);
      setDeletingDay(null);
      await loadItineraryDays();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete itinerary day.");
    } finally {
      setIsDeletingDay(false);
    }
  };

  // Add attraction directly into chosen itinerary day
  const handleAddAttractionToDay = async () => {
    if (!selectedAttraction) return;
    setIsAddingAttraction(true);
    setNotification(null);

    try {
      let dayId: number;
      let dayDate: string | null = null;

      if (targetDayId === "NEW" || days.length === 0) {
        const newDayNumber = suggestedNextDayNumber;
        const newDay = await createItinerary(trip.id, {
          dayNumber: newDayNumber,
          title: `Day ${newDayNumber}: ${selectedAttraction.name}`,
          description: `Sightseeing and exploring ${selectedAttraction.name}`,
        });
        dayId = newDay.id;
        dayDate = newDay.date || trip.startDate;
      } else {
        dayId = Number(targetDayId || days[0].id);
        const targetDay = days.find((d) => d.id === dayId);
        dayDate = targetDay?.date || trip.startDate;
      }

      let formattedStartTime: string | null = null;
      if (activityTime && dayDate) {
        formattedStartTime = `${dayDate}T${activityTime}:00`;
      } else if (activityTime && trip.startDate) {
        formattedStartTime = `${trip.startDate}T${activityTime}:00`;
      }

      await createActivity(dayId, {
        name: selectedAttraction.name,
        description: `Attraction discovered via OpenStreetMap for ${trip.destination?.name || "destination"}. Category: ${selectedAttraction.category || "Sightseeing"}`,
        location: selectedAttraction.address || trip.destination?.name || "",
        startTime: formattedStartTime,
        endTime: null,
      });

      setNotification({
        type: "success",
        message: `"${selectedAttraction.name}" was added to your trip itinerary!`,
      });

      setSelectedAttraction(null);
      await loadItineraryDays();
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to add attraction to itinerary.",
      });
    } finally {
      setIsAddingAttraction(false);
    }
  };

  const suggestedNextDayNumber = days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Trip Itinerary</h2>
            {!loading && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {days.length} Day{days.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Day-by-day activity schedule and sightseeing plan for {trip.title}.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDay(null);
            setDayModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95"
        >
          <span>+</span> Add Day
        </button>
      </div>

      {/* Global Notifications */}
      {notification && (
        <div
          className={`mt-6 flex items-center justify-between rounded-2xl border p-4 text-sm font-bold shadow-sm ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 text-xs font-extrabold uppercase tracking-wider opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
          ⚠️ {error}
        </div>
      )}

      {/* Relevant Places & Attractions Bar */}
      {attractions.length > 0 && (
        <div className="mt-7 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-5 border shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏛️</span>
                <h3 className="text-sm font-black text-slate-900">
                  Relevant Attractions in {trip.destination?.name || "Destination"}
                </h3>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  OpenStreetMap
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Discover popular points of interest and click <strong>+ Add to Day</strong> to insert them into your itinerary schedule.
              </p>
            </div>
          </div>

          {/* Attractions Horizontal Slider Grid */}
          <div className="flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-indigo-200">
            {attractions.map((attraction) => (
              <div
                key={attraction.id || attraction.name}
                className="group relative flex w-72 shrink-0 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={attraction.name}>
                      {attraction.name}
                    </h4>
                    {attraction.rating != null && (
                      <span className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        ⭐ {attraction.rating}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-100">
                      {attraction.category || "Attraction"}
                    </span>
                  </div>

                  {attraction.address && (
                    <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">📍 {attraction.address}</p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    onClick={() => {
                      setSelectedAttraction(attraction);
                      setTargetDayId(days.length > 0 ? days[0].id : "NEW");
                    }}
                    className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                  >
                    + Add to Day
                  </button>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + " " + (trip.destination?.name || ""))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-slate-100 p-1.5 text-xs text-slate-600 hover:bg-indigo-100 hover:text-indigo-800 transition"
                    title="View on Map"
                  >
                    🗺️
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Day-by-Day List */}
      <div className="mt-8">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            Loading trip itinerary...
          </div>
        ) : days.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
              📅
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900">No itinerary yet.</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Build your travel schedule day-by-day or pick an attraction above to get started.
            </p>
            <button
              onClick={() => {
                setEditingDay(null);
                setDayModalOpen(true);
              }}
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
            >
              Generate Itinerary
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {days.map((day) => (
              <ItineraryDayCard
                key={day.id}
                day={day}
                trip={trip}
                onEditDay={(d) => {
                  setEditingDay(d);
                  setDayModalOpen(true);
                }}
                onDeleteDay={(d) => setDeletingDay(d)}
                onNotification={(msg) => setNotification({ type: "success", message: msg })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Attraction to Itinerary Modal */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-700 border border-indigo-100">
                📌
              </div>
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold text-indigo-700 border border-indigo-100">
                  {selectedAttraction.category || "Attraction"}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                  Add to Trip Itinerary
                </h3>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-sm font-black text-slate-900">{selectedAttraction.name}</p>
              {selectedAttraction.address && (
                <p className="mt-1 text-xs text-slate-500">📍 {selectedAttraction.address}</p>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Itinerary Day
                </label>
                <select
                  value={targetDayId}
                  onChange={(e) => setTargetDayId(e.target.value === "NEW" ? "NEW" : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {days.map((d) => (
                    <option key={d.id} value={d.id}>
                      Day {d.dayNumber}: {d.title}
                    </option>
                  ))}
                  <option value="NEW">+ Create New Day ({suggestedNextDayNumber})</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                disabled={isAddingAttraction}
                onClick={() => setSelectedAttraction(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isAddingAttraction}
                onClick={handleAddAttractionToDay}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {isAddingAttraction ? "Adding..." : "Confirm & Add Activity"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                {isDeletingDay ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
