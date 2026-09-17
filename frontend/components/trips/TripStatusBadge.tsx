"use client";

import React from "react";
import type { TripStatus } from "../../lib/types";

interface TripStatusBadgeProps {
  status?: TripStatus | string;
  startDate?: string;
  endDate?: string;
  variant?: "solid" | "subtle" | "outline";
  className?: string;
}

export default function TripStatusBadge({
  status,
  startDate,
  endDate,
  variant = "subtle",
  className = "",
}: TripStatusBadgeProps) {
  let resolvedStatus = (status || "").toUpperCase();

  if (!resolvedStatus && startDate && endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (end < today) resolvedStatus = "COMPLETED";
    else if (start <= today && end >= today) resolvedStatus = "ACTIVE";
    else resolvedStatus = "PLANNED";
  }

  let label = "PLANNED";
  let colorClasses = "";

  switch (resolvedStatus) {
    case "ACTIVE":
    case "ONGOING":
      label = "Ongoing";
      colorClasses =
        variant === "solid"
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-emerald-50 text-emerald-700 border border-emerald-200/80";
      break;
    case "COMPLETED":
      label = "Completed";
      colorClasses =
        variant === "solid"
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-blue-50 text-blue-700 border border-blue-200/80";
      break;
    case "CANCELLED":
      label = "Cancelled";
      colorClasses =
        variant === "solid"
          ? "bg-rose-600 text-white shadow-sm"
          : "bg-rose-50 text-rose-700 border border-rose-200/80";
      break;
    case "PLANNED":
    case "UPCOMING":
    default:
      label = "Upcoming";
      colorClasses =
        variant === "solid"
          ? "bg-indigo-600 text-white shadow-sm"
          : "bg-indigo-50 text-indigo-700 border border-indigo-200/80";
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${colorClasses} ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full fill-current bg-current"></span>
      {label}
    </span>
  );
}
