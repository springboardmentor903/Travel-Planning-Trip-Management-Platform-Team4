"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { DateAnalyticsDTO } from "../../../lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PopularMonthsChartProps {
  dateAnalytics: DateAnalyticsDTO;
}

export default function PopularMonthsChart({ dateAnalytics }: PopularMonthsChartProps) {
  const months = dateAnalytics.popularTravelMonths || [];
  const hasData = months.length > 0 && months.some((m) => m.tripCount > 0);

  const chartData = {
    labels: months.map((m) => m.monthName),
    datasets: [
      {
        label: "Trips Planned",
        data: months.map((m) => m.tripCount),
        backgroundColor: "rgba(14, 165, 233, 0.85)", // sky blue
        borderColor: "#0284c7",
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { precision: 0, color: "#94a3b8", font: { size: 10 } },
      },
    },
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl sm:p-8">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-extrabold text-white">Popular Travel Months</h3>
          <p className="mt-1 text-xs text-slate-400">
            Seasonality distribution of trip start dates across calendar months
          </p>
        </div>

        {/* Avg Duration Pill */}
        <div className="flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-950/40 px-3.5 py-1.5 text-xs text-indigo-300 font-bold">
          <span>⏱️ Avg. Trip Duration:</span>
          <span className="text-white font-black">{dateAnalytics.averageTripDurationDays || 0} Days</span>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        {hasData ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center">
            <p className="text-xs text-slate-400 font-semibold">
              No data available for the selected period.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
