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
import type { BudgetAnalyticsDTO } from "../../../lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BudgetDistributionChartProps {
  budgetAnalytics: BudgetAnalyticsDTO;
}

export default function BudgetDistributionChart({ budgetAnalytics }: BudgetDistributionChartProps) {
  const buckets = budgetAnalytics.rangeDistribution || [];
  const hasData = buckets.length > 0 && buckets.some((b) => b.tripCount > 0);

  const chartData = {
    labels: buckets.map((b) => b.rangeLabel),
    datasets: [
      {
        label: "Trips in Budget Range",
        data: buckets.map((b) => b.tripCount),
        backgroundColor: "rgba(16, 185, 129, 0.85)", // emerald
        borderColor: "#059669",
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
        callbacks: {
          label: function (context: any) {
            const bucket = buckets[context.dataIndex];
            return ` Trips: ${context.raw} (${bucket.percentage}%)`;
          },
        },
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
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-extrabold text-white">Budget Range Distribution</h3>
          <p className="mt-1 text-xs text-slate-400">
            Itinerary count grouped by expenditure range buckets
          </p>
        </div>

        {/* Budget Metric Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-bold text-emerald-400">
            Avg: ${budgetAnalytics.averageBudget?.toLocaleString() || 0}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300 font-semibold">
            Min: ${budgetAnalytics.minBudget?.toLocaleString() || 0}
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300 font-semibold">
            Max: ${budgetAnalytics.maxBudget?.toLocaleString() || 0}
          </div>
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

      {/* Summary Footer */}
      <div className="mt-4 flex justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
        <span className="text-slate-400 font-semibold">Total Planned Platform Budget:</span>
        <span className="font-extrabold text-emerald-400 font-mono">
          ${budgetAnalytics.totalPlannedBudget?.toLocaleString() || 0}
        </span>
      </div>
    </div>
  );
}
