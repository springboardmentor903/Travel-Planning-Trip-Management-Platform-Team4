"use client";

import { useEffect, useState } from "react";
import type { Activity, CreateActivityRequest } from "../../lib/types";

export default function ActivityModal({
  isOpen,
  initialData,
  onSave,
  onClose,
  isSaving,
}: {
  isOpen: boolean;
  initialData?: Activity | null;
  onSave: (data: CreateActivityRequest) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setLocation(initialData.location || "");
      setStartTime(initialData.startTime ? formatForDateTimeInput(initialData.startTime) : "");
      setEndTime(initialData.endTime ? formatForDateTimeInput(initialData.endTime) : "");
    } else {
      setName("");
      setDescription("");
      setLocation("");
      setStartTime("");
      setEndTime("");
    }
    setError("");
    setFieldErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = "Activity name is required.";
    }

    if (startTime && endTime && new Date(endTime) < new Date(startTime)) {
      errors.endTime = "End time cannot be before start time.";
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
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        location: location.trim() ? location.trim() : null,
        startTime: startTime ? startTime : null,
        endTime: endTime ? endTime : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-900">
            {initialData ? "Edit Activity" : "Add New Activity"}
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
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Scuba Diving at Turtle Beach"
              className={`mt-1 w-full rounded-xl border p-2.5 text-sm transition outline-none ${
                fieldErrors.name
                  ? "border-red-300 bg-red-50/50 focus:border-red-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />
            {fieldErrors.name && (
              <span className="mt-1 block text-xs font-semibold text-red-600">{fieldErrors.name}</span>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kuta Beachfront Pier (Optional)"
              className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm transition outline-none focus:border-indigo-500"
            />
          </div>

          {/* Start and End Times */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm transition outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">End Time</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (fieldErrors.endTime) setFieldErrors((prev) => ({ ...prev, endTime: "" }));
                }}
                className={`mt-1 w-full rounded-xl border p-2.5 text-sm transition outline-none ${
                  fieldErrors.endTime
                    ? "border-red-300 bg-red-50/50 focus:border-red-500"
                    : "border-slate-200 focus:border-indigo-500"
                }`}
              />
              {fieldErrors.endTime && (
                <span className="mt-1 block text-xs font-semibold text-red-600">{fieldErrors.endTime}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700">Description / Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, booking numbers, or notes for this activity..."
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
              {isSaving ? "Saving…" : initialData ? "Update Activity" : "Add Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatForDateTimeInput(isoStr: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr.slice(0, 16);
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return isoStr.slice(0, 16);
  }
}
