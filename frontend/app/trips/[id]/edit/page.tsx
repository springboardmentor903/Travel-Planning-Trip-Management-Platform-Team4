"use client";

import AppShell from "../../../../components/AppShell";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDestinations, getTrip, updateTrip } from "../../../../lib/api";
import type { Destination, Trip } from "../../../../lib/types";

export default function EditTripPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);

  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!params.id) return;
    setPageLoading(true);
    setError("");

    Promise.all([getTrip(params.id), getDestinations()])
      .then(([tripData, destinationList]) => {
        setTrip(tripData);
        setDestinations(destinationList);

        setTitle(tripData.title);
        setDestinationId(String(tripData.destination?.id || ""));
        setStartDate(tripData.startDate);
        setEndDate(tripData.endDate);
        setBudget(tripData.budget == null ? "" : String(tripData.budget));
        setNotes(tripData.notes || "");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load trip data.");
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [params.id]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!title.trim()) {
      errors.title = "Trip title is required.";
    }

    if (!destinationId) {
      errors.destinationId = "Please select a destination.";
    }

    if (!startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!endDate) {
      errors.endDate = "End date is required.";
    }

    if (startDate && endDate && endDate < startDate) {
      errors.endDate = "End date cannot be before start date.";
    }

    if (budget !== "" && (isNaN(Number(budget)) || Number(budget) < 0)) {
      errors.budget = "Budget must be a valid non-negative number.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await updateTrip(params.id, {
        title: title.trim(),
        destinationId: Number(destinationId),
        startDate,
        endDate,
        budget: budget ? Number(budget) : null,
        notes: notes.trim() ? notes.trim() : null,
      });

      router.push(`/trips/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update trip. Please check details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-7">
        <Link href={`/trips/${params.id}`} className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
          ← Back to Trip Details
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
          {pageLoading ? "Edit Trip" : `Edit Trip: ${trip?.title || ""}`}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update travel dates, budget, destination, or notes.
        </p>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="mb-6 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Content State */}
      {pageLoading ? (
        <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          Loading trip details from backend…
        </div>
      ) : !trip ? (
        <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-lg font-bold text-slate-800">Trip not found</p>
          <p className="mt-1 text-sm text-slate-500">The trip you are attempting to edit does not exist or was deleted.</p>
          <Link href="/trips" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">
            Return to Trip List
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Title */}
            <Field label="Trip Title" error={fieldErrors.title} required>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: "" }));
                }}
                className={`w-full rounded-xl border p-3 text-sm transition outline-none ${
                  fieldErrors.title
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              />
            </Field>

            {/* Destination */}
            <Field label="Destination" error={fieldErrors.destinationId} required>
              <select
                required
                value={destinationId}
                onChange={(e) => {
                  setDestinationId(e.target.value);
                  if (fieldErrors.destinationId) setFieldErrors((prev) => ({ ...prev, destinationId: "" }));
                }}
                className={`w-full rounded-xl border p-3 text-sm transition outline-none ${
                  fieldErrors.destinationId
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              >
                <option value="">Select a destination</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.country ? `(${d.country})` : ""}
                  </option>
                ))}
              </select>
            </Field>

            {/* Start Date */}
            <Field label="Start Date" error={fieldErrors.startDate} required>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (fieldErrors.startDate) setFieldErrors((prev) => ({ ...prev, startDate: "" }));
                }}
                className={`w-full rounded-xl border p-3 text-sm transition outline-none ${
                  fieldErrors.startDate
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              />
            </Field>

            {/* End Date */}
            <Field label="End Date" error={fieldErrors.endDate} required>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (fieldErrors.endDate) setFieldErrors((prev) => ({ ...prev, endDate: "" }));
                }}
                className={`w-full rounded-xl border p-3 text-sm transition outline-none ${
                  fieldErrors.endDate
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              />
            </Field>

            {/* Budget */}
            <Field label="Total Budget (INR)" error={fieldErrors.budget}>
              <input
                type="number"
                min="0"
                step="any"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  if (fieldErrors.budget) setFieldErrors((prev) => ({ ...prev, budget: "" }));
                }}
                className={`w-full rounded-xl border p-3 text-sm transition outline-none ${
                  fieldErrors.budget
                    ? "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                }`}
              />
            </Field>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <Field label="Trip Notes & Reminders">
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving Changes…" : "Save Changes"}
            </button>
            <Link
              href={`/trips/${params.id}`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </AppShell>
  );
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  );
}
