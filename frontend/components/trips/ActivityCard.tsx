"use client";

import type { Activity } from "../../lib/types";

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formattedTime = formatActivityTime(activity.startTime, activity.endTime);

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="font-extrabold text-slate-900">{activity.name}</h4>
          {formattedTime && (
            <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
              ⏰ {formattedTime}
            </span>
          )}
        </div>

        {activity.location && (
          <p className="mt-1 text-xs font-bold text-slate-500">
            📍 {activity.location}
          </p>
        )}

        {activity.description && (
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {activity.description}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2.5">
        <button
          onClick={onEdit}
          className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function formatActivityTime(startIso: string | null, endIso: string | null): string {
  if (!startIso && !endIso) return "";

  const formatSingle = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const startFormatted = startIso ? formatSingle(startIso) : "";
  const endFormatted = endIso ? formatSingle(endIso) : "";

  if (startFormatted && endFormatted) {
    return `${startFormatted} – ${endFormatted}`;
  }
  return startFormatted || endFormatted;
}
