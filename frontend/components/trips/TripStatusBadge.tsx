"use client";

import type { TripStatus } from "../../lib/types";

interface TripStatusBadgeProps {
  status?: TripStatus | string | null;
  startDate?: string;
  endDate?: string;
  variant?: "solid" | "subtle";
  className?: string;
}

export default function TripStatusBadge({
  status,
  startDate,
  endDate,
  variant = "subtle",
  className = "",
}: TripStatusBadgeProps) {
  // Resolve status: use backend status first; if missing, fallback safely based on dates
  let resolvedStatus: TripStatus = "PLANNED";

  if (status === "ACTIVE" || status === "PLANNED" || status === "COMPLETED") {
    resolvedStatus = status;
  } else if (startDate && endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end < today) {
      resolvedStatus = "COMPLETED";
    } else if (start <= today && end >= today) {
      resolvedStatus = "ACTIVE";
    } else {
      resolvedStatus = "PLANNED";
    }
  }

  if (variant === "solid") {
    if (resolvedStatus === "ACTIVE") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          Active
        </span>
      );
    }
    if (resolvedStatus === "COMPLETED") {
      return (
        <span
          className={`inline-flex items-center rounded-full bg-slate-700 px-3 py-1 text-xs font-extrabold text-white shadow-sm ${className}`}
        >
          Completed
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-extrabold text-white shadow-sm ${className}`}
      >
        Planned
      </span>
    );
  }

  // Subtle variant (default)
  if (resolvedStatus === "ACTIVE") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  if (resolvedStatus === "COMPLETED") {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-700 ${className}`}
      >
        Completed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700 ${className}`}
    >
      Planned
    </span>
  );
}
