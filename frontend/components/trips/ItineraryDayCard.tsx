"use client";

import { useEffect, useState } from "react";
import type { Activity, CreateActivityRequest, ItineraryDay } from "../../lib/types";
import { createActivity, deleteActivity, getActivities, updateActivity } from "../../lib/api";
import ActivityCard from "./ActivityCard";
import ActivityModal from "./ActivityModal";

export default function ItineraryDayCard({
  day,
  onEditDay,
  onDeleteDay,
}: {
  day: ItineraryDay;
  onEditDay: (day: ItineraryDay) => void;
  onDeleteDay: (day: ItineraryDay) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [savingActivity, setSavingActivity] = useState(false);

  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);
  const [isDeletingActivity, setIsDeletingActivity] = useState(false);

  const loadActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getActivities(day.id);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activities for this day.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [day.id]);

  const handleSaveActivity = async (requestData: CreateActivityRequest) => {
    setSavingActivity(true);
    try {
      if (editingActivity) {
        await updateActivity(day.id, editingActivity.id, requestData);
      } else {
        await createActivity(day.id, requestData);
      }
      setActivityModalOpen(false);
      setEditingActivity(null);
      await loadActivities();
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;
    setIsDeletingActivity(true);
    try {
      await deleteActivity(day.id, deletingActivity.id);
      setDeletingActivity(null);
      await loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity.");
    } finally {
      setIsDeletingActivity(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-3 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100"
            title={expanded ? "Collapse day" : "Expand day"}
          >
            {expanded ? "−" : "+"}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-extrabold text-white">
                Day {day.dayNumber}
              </span>
              <h3 className="font-extrabold text-slate-900">{day.title}</h3>
              {day.date && (
                <span className="text-xs font-semibold text-slate-500">
                  • {formatDate(day.date)}
                </span>
              )}
            </div>
            {day.description && (
              <p className="mt-1 text-xs text-slate-600 line-clamp-1">{day.description}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => {
              setEditingActivity(null);
              setActivityModalOpen(true);
            }}
            className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            + Add Activity
          </button>
          <button
            onClick={() => onEditDay(day)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Edit Day
          </button>
          <button
            onClick={() => onDeleteDay(day)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
          >
            Delete Day
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 sm:p-5">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-500">
              Loading activities…
            </div>
          ) : activities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
              <p className="text-xs font-semibold text-slate-500">No activities scheduled for Day {day.dayNumber} yet.</p>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setActivityModalOpen(true);
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                + Add your first activity
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEdit={() => {
                    setEditingActivity(activity);
                    setActivityModalOpen(true);
                  }}
                  onDelete={() => setDeletingActivity(activity)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Add/Edit Modal */}
      <ActivityModal
        isOpen={activityModalOpen}
        initialData={editingActivity}
        onSave={handleSaveActivity}
        onClose={() => {
          setActivityModalOpen(false);
          setEditingActivity(null);
        }}
        isSaving={savingActivity}
      />

      {/* Delete Activity Confirmation Modal */}
      {deletingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="text-base font-extrabold text-slate-900">Delete Activity</h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Delete activity <span className="font-bold text-slate-900">"{deletingActivity.name}"</span> from Day {day.dayNumber}?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={isDeletingActivity}
                onClick={() => setDeletingActivity(null)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingActivity}
                onClick={handleDeleteActivity}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingActivity ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function formatDate(val: string) {
  if (!val) return "";
  return new Date(`${val}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
