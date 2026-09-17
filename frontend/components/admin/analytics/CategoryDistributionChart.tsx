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
import type { CategoryDistributionDTO } from "../../../lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CategoryDistributionChartProps {
  categories: CategoryDistributionDTO[];
}

export default function CategoryDistributionChart({ categories }: CategoryDistributionChartProps) {
  const hasData = categories && categories.length > 0;

  const chartData = {
    labels: categories.map((c) => c.category || "Uncategorized"),
    datasets: [
      {
        label: "Destinations Count",
        data: categories.map((c) => c.count),
        backgroundColor: [
          "rgba(99, 102, 241, 0.85)",  // indigo
          "rgba(14, 165, 233, 0.85)",  // sky
          "rgba(168, 85, 247, 0.85)",  // purple
          "rgba(236, 72, 153, 0.85)",  // pink
          "rgba(245, 158, 11, 0.85)",  // amber
          "rgba(16, 185, 129, 0.85)",  // emerald
          "rgba(20, 184, 166, 0.85)",  // teal
        ],
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
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
            const item = categories[context.dataIndex];
            return ` Destinations: ${context.raw} (${item.percentage}%)`;
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
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-extrabold text-white">Destination Category Distribution</h3>
        <p className="mt-1 text-xs text-slate-400">
          Categorical breakdown across Metropolitan, Beach & Nature, Historical, Coastal, and Luxury
        </p>
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
