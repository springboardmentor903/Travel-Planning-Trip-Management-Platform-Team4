"use client";

import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createTrip, getDestinations } from "../../../lib/api";
import type { Destination } from "../../../lib/types";
import { useRouter } from "next/navigation";

export default function NewTripPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    getDestinations()
      .then(setDestinations)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load destinations."))
      .finally(() => setPageLoading(false));
  }, []);

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const trip = await createTrip({
        title: title.trim(),
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
      {/* Header */}
      <div className="mb-7">
        <Link href="/trips" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
          ← Back to Trip History
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Plan a New Trip</h1>
        <p className="mt-1 text-sm text-slate-500">
          Select your destination and travel dates to start planning.
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 max-w-3xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Trip Form Card */}
      <form onSubmit={submit} className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
              placeholder="e.g. Summer Vacation in Bali"
            />
          </Field>

          {/* Destination Dropdown */}
          <Field label="Destination" error={fieldErrors.destinationId} required>
            <select
              required
              disabled={pageLoading}
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
              <option value="">{pageLoading ? "Loading destinations…" : "Select a destination"}</option>
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
              placeholder="e.g. 50000 (Optional)"
            />
          </Field>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <Field label="Trip Notes & Packing Reminders">
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="Add any additional notes, flight details, or reminders for this trip..."
            />
          </Field>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={loading || pageLoading}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating Trip…" : "Create Trip"}
          </button>
          <Link
            href="/trips"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
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
