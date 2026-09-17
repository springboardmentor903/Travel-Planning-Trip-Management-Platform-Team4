"use client";

import type { Activity, Trip } from "../../lib/types";
import { activityToCalendarEvent, buildGoogleCalendarUrl, downloadIcsFile } from "../../lib/calendarExport";

export default function ActivityCard({
  activity,
  trip,
  dayDate,
  onEdit,
  onDelete,
  onNotification,
}: {
  activity: Activity;
  trip?: Trip;
  dayDate?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onNotification?: (msg: string) => void;
}) {
  const formattedTime = formatActivityTime(activity.startTime, activity.endTime);

  const handleGoogleCal = () => {
    if (!trip) return;
    const evtData = activityToCalendarEvent(activity, trip, dayDate);
    const url = buildGoogleCalendarUrl(evtData);
    window.open(url, "_blank", "noopener,noreferrer");
    if (onNotification) onNotification("Google Calendar link opened.");
  };

  const handleIcsExport = () => {
    if (!trip) return;
    const evtData = activityToCalendarEvent(activity, trip, dayDate);
    const filename = `${activity.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.ics`;
    downloadIcsFile(filename, [evtData]);
    if (onNotification) onNotification("Calendar file downloaded.");
  };

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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        {trip && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleGoogleCal}
              className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-800 transition hover:bg-amber-100"
              title="Add activity to Google Calendar"
            >
              📅 GCal
            </button>
            <button
              onClick={handleIcsExport}
              className="rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-100"
              title="Download .ics file for this activity"
            >
              🗓️ .ics
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
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
