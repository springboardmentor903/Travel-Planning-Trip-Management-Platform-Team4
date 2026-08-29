"use client";

import { useEffect, useState } from "react";
import type { CreateItineraryDayRequest, ItineraryDay, Trip } from "../../lib/types";

export default function ItineraryDayModal({
  isOpen,
  initialData,
  suggestedNextDayNumber,
  trip,
  onSave,
  onClose,
  isSaving,
}: {
  isOpen: boolean;
  initialData?: ItineraryDay | null;
  suggestedNextDayNumber: number;
  trip: Trip;
  onSave: (data: CreateItineraryDayRequest) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [dayNumber, setDayNumber] = useState<number>(suggestedNextDayNumber);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setDayNumber(initialData.dayNumber);
      setTitle(initialData.title || "");
      setDate(initialData.date || "");
      setDescription(initialData.description || "");
    } else {
      setDayNumber(suggestedNextDayNumber);
      setTitle(`Day ${suggestedNextDayNumber}`);
      setDate(calculateDefaultDateForDay(trip.startDate, suggestedNextDayNumber));
      setDescription("");
    }
    setError("");
    setFieldErrors({});
  }, [initialData, suggestedNextDayNumber, trip, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!dayNumber || dayNumber < 1) {
      errors.dayNumber = "Day number must be at least 1.";
    }

    if (!title.trim()) {
      errors.title = "Itinerary day title is required.";
    }

    if (date) {
      if (trip.startDate && date < trip.startDate) {
        errors.date = `Date cannot be before trip start date (${trip.startDate}).`;
      } else if (trip.endDate && date > trip.endDate) {
        errors.date = `Date cannot be after trip end date (${trip.endDate}).`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      await onSave({
        dayNumber: Number(dayNumber),
        title: title.trim(),
        date: date ? date : null,
        description: description.trim() ? description.trim() : null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save itinerary day.";
      if (msg.toLowerCase().includes("already exists")) {
        setError(`Day number ${dayNumber} already exists for this trip. Please select a different day number.`);
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {initialData ? "Edit Itinerary Day" : "Add Itinerary Day"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Day Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Day Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={dayNumber}
                onChange={(e) => {
                  setDayNumber(Number(e.target.value));
                  if (fieldErrors.dayNumber) setFieldErrors((prev) => ({ ...prev, dayNumber: "" }));
                }}
                className={`mt-1 w-full rounded-xl border p-2.5 text-sm transition outline-none ${
                  fieldErrors.dayNumber
                    ? "border-red-300 bg-red-50/50 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />
              {fieldErrors.dayNumber && (
                <span className="mt-1 block text-xs font-semibold text-red-600">{fieldErrors.dayNumber}</span>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700">Date (Optional)</label>
              <input
                type="date"
                value={date}
                min={trip.startDate}
                max={trip.endDate}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: "" }));
                }}
                className={`mt-1 w-full rounded-xl border p-2.5 text-sm transition outline-none ${
                  fieldErrors.date
                    ? "border-red-300 bg-red-50/50 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />
              {fieldErrors.date && (
                <span className="mt-1 block text-xs font-semibold text-red-600">{fieldErrors.date}</span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
              }}
              placeholder="e.g. Arrival & Beach Exploration"
              className={`mt-1 w-full rounded-xl border p-2.5 text-sm transition outline-none ${
                fieldErrors.title
                  ? "border-red-300 bg-red-50/50 focus:border-red-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            {fieldErrors.title && (
              <span className="mt-1 block text-xs font-semibold text-red-600">{fieldErrors.title}</span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700">Description / Overview</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what is planned for this day..."
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 p-2.5 text-sm transition outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? "Saving…" : initialData ? "Save Changes" : "Add Day"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calculateDefaultDateForDay(startDateStr: string, dayNum: number): string {
  if (!startDateStr) return "";
  try {
    const d = new Date(`${startDateStr}T00:00:00`);
    if (isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + (dayNum - 1));
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}
