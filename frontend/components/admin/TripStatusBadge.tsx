"use client";

interface TripStatusBadgeProps {
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | string;
  derivedStatus?: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | string;
}

export default function TripStatusBadge({ status, derivedStatus }: TripStatusBadgeProps) {
  const displayStatus = derivedStatus || status || "PLANNED";

  let colorClasses = "bg-indigo-950/60 border-indigo-500/40 text-indigo-300";
  let dotColor = "bg-indigo-400";

  if (displayStatus === "CANCELLED") {
    colorClasses = "bg-rose-950/60 border-rose-500/40 text-rose-300";
    dotColor = "bg-rose-500";
  } else if (displayStatus === "ONGOING" || displayStatus === "ACTIVE") {
    colorClasses = "bg-emerald-950/60 border-emerald-500/40 text-emerald-300";
    dotColor = "bg-emerald-400 animate-pulse";
  } else if (displayStatus === "UPCOMING" || displayStatus === "PLANNED") {
    colorClasses = "bg-sky-950/60 border-sky-500/40 text-sky-300";
    dotColor = "bg-sky-400";
  } else if (displayStatus === "COMPLETED") {
    colorClasses = "bg-slate-800 border-slate-700 text-slate-300";
    dotColor = "bg-slate-400";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {displayStatus}
    </span>
  );
}
