"use client";

import React from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { UserAnalyticsDTO } from "../../../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UserRegistrationChartProps {
  userAnalytics: UserAnalyticsDTO;
}

export default function UserRegistrationChart({ userAnalytics }: UserRegistrationChartProps) {
  const trend = userAnalytics.registrationTrend || [];
  const hasData = trend.length > 0 && trend.some((item) => item.count > 0);

  const chartData = {
    labels: trend.map((item) => item.period || "Unknown"),
    datasets: [
      {
        label: "New User Registrations",
        data: trend.map((item) => item.count),
        fill: true,
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.15)",
        tension: 0.35,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#94a3b8",
          font: { size: 11, weight: 600 },
        },
      },
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
      <div className="flex flex-col justify-between gap-2 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-extrabold text-white">User Registration Trend</h3>
          <p className="mt-1 text-xs text-slate-400">
            Account registration volume over time across the platform
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Link
            href="/admin/users?role=TRAVELER"
            className="rounded-full bg-indigo-500/10 px-3 py-1 font-bold text-indigo-400 ring-1 ring-indigo-500/20 hover:bg-indigo-500/20 hover:ring-indigo-500/40 transition cursor-pointer"
          >
            Travelers: {userAnalytics.travelerCount} ➔
          </Link>
          <Link
            href="/admin/users?role=ADMINISTRATOR"
            className="rounded-full bg-purple-500/10 px-3 py-1 font-bold text-purple-400 ring-1 ring-purple-500/20 hover:bg-purple-500/20 hover:ring-purple-500/40 transition cursor-pointer"
          >
            Admins: {userAnalytics.adminCount} ➔
          </Link>
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        {hasData ? (
          <Line data={chartData} options={chartOptions} />
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
