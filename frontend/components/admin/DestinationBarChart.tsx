"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { DestinationAnalytics } from "../../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DestinationBarChartProps {
  destinations: DestinationAnalytics[];
}

export default function DestinationBarChart({ destinations }: DestinationBarChartProps) {
  if (!destinations || destinations.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-slate-400">
        <span className="text-3xl">🗺️</span>
        <p className="mt-2 text-sm font-bold text-slate-200">No trip data available yet.</p>
        <p className="mt-0.5 text-xs text-slate-400">
          When users create trips for destinations, popularity rankings will appear here automatically.
        </p>
      </div>
    );
  }

  // Sorted descending by trip count
  const sorted = [...destinations].sort((a, b) => b.tripCount - a.tripCount);

  const labels = sorted.map((d) => d.destinationName);
  const dataValues = sorted.map((d) => d.tripCount);

  const colors = [
    "rgba(99, 102, 241, 0.85)", // Indigo
    "rgba(139, 92, 246, 0.85)", // Purple
    "rgba(59, 130, 246, 0.85)",  // Blue
    "rgba(14, 165, 233, 0.85)",  // Sky
    "rgba(16, 185, 129, 0.85)",  // Emerald
  ];

  const borderColors = [
    "#6366f1",
    "#8b5cf6",
    "#3b82f6",
    "#0ea5e9",
    "#10b981",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Trips Created",
        data: dataValues,
        backgroundColor: colors.slice(0, sorted.length),
        borderColor: borderColors.slice(0, sorted.length),
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
            const count = context.parsed.x || 0;
            return ` ${count} trip${count === 1 ? "" : "s"} planned`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: "rgba(51, 65, 85, 0.4)",
        },
        ticks: {
          color: "#94a3b8",
          stepSize: 1,
          precision: 0,
          font: {
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#e2e8f0",
          font: {
            weight: 700,
            size: 13,
          },
        },
      },
    },
  };

  return (
    <div className="relative h-72 w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
