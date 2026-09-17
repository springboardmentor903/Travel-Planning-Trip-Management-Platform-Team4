"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { TripMonthlyCount } from "../../lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TripsOverTimeChartProps {
  data?: TripMonthlyCount[];
}

export default function TripsOverTimeChart({ data = [] }: TripsOverTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-6 text-center text-slate-400">
        <span className="text-3xl">📈</span>
        <p className="mt-2 text-sm font-bold text-slate-200">No timeline data available.</p>
        <p className="mt-0.5 text-xs text-slate-400">
          As travelers schedule trips across months, monthly growth trends will appear here.
        </p>
      </div>
    );
  }

  const labels = data.map((d) => d.month);
  const values = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Trips Created",
        data: values,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#818cf8",
        pointBorderColor: "#312e81",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: TooltipItem<"line">) => ` ${context.parsed.y} trips planned`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", stepSize: 1, precision: 0 },
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}
