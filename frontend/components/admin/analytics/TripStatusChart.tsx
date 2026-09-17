"use client";

import React from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface TripStatusChartProps {
  statusCounts: {
    upcomingTrips: number;
    ongoingTrips: number;
    completedTrips: number;
    cancelledTrips: number;
  };
}

export default function TripStatusChart({ statusCounts }: TripStatusChartProps) {
  const { upcomingTrips, ongoingTrips, completedTrips, cancelledTrips } = statusCounts;
  const total = upcomingTrips + ongoingTrips + completedTrips + cancelledTrips;

  const chartData = {
    labels: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
    datasets: [
      {
        data: [upcomingTrips, ongoingTrips, completedTrips, cancelledTrips],
        backgroundColor: [
          "rgba(56, 189, 248, 0.85)",  // sky blue
          "rgba(52, 211, 153, 0.85)",  // emerald
          "rgba(192, 132, 252, 0.85)", // purple
          "rgba(251, 113, 133, 0.85)", // rose
        ],
        borderColor: [
          "#0284c7",
          "#059669",
          "#7c3aed",
          "#e11d48",
        ],
        borderWidth: 1.5,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#cbd5e1",
          font: { size: 11, weight: 600 },
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: function (context: any) {
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl sm:p-8">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-extrabold text-white">Trip Status Distribution</h3>
        <p className="mt-1 text-xs text-slate-400">
          Proportion of trips by operational lifecycle status
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="h-60 w-full max-w-xs">
          {total > 0 ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center">
              <p className="text-xs text-slate-400 font-semibold">
                No data available for the selected period.
              </p>
            </div>
          )}
        </div>

        {total > 0 && (
          <div className="mt-4 grid w-full grid-cols-2 gap-2 text-center text-xs">
            <Link
              href="/admin/trips?status=PLANNED"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 transition hover:border-sky-500/50 hover:bg-slate-900 group cursor-pointer block"
            >
              <span className="text-slate-400 group-hover:text-slate-200">Upcoming: </span>
              <span className="font-bold text-sky-400 font-mono text-sm">{upcomingTrips}</span>
              <span className="block text-[10px] text-sky-400/70 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to view ➔</span>
            </Link>

            <Link
              href="/admin/trips?status=ACTIVE"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 transition hover:border-emerald-500/50 hover:bg-slate-900 group cursor-pointer block"
            >
              <span className="text-slate-400 group-hover:text-slate-200">Ongoing: </span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{ongoingTrips}</span>
              <span className="block text-[10px] text-emerald-400/70 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to view ➔</span>
            </Link>

            <Link
              href="/admin/trips?status=COMPLETED"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 transition hover:border-purple-500/50 hover:bg-slate-900 group cursor-pointer block"
            >
              <span className="text-slate-400 group-hover:text-slate-200">Completed: </span>
              <span className="font-bold text-purple-400 font-mono text-sm">{completedTrips}</span>
              <span className="block text-[10px] text-purple-400/70 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to view ➔</span>
            </Link>

            <Link
              href="/admin/trips?status=CANCELLED"
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 transition hover:border-rose-500/50 hover:bg-slate-900 group cursor-pointer block"
            >
              <span className="text-slate-400 group-hover:text-slate-200">Cancelled: </span>
              <span className="font-bold text-rose-400 font-mono text-sm">{cancelledTrips}</span>
              <span className="block text-[10px] text-rose-400/70 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">Click to view ➔</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
