"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { CategorySummary, ExpenseCategory } from "../../lib/types";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface CategoryChartProps {
  summaries: CategorySummary[];
}

const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; border: string; name: string }> = {
  TRANSPORTATION: { bg: "#3b82f6", border: "#2563eb", name: "Transportation" },
  HOTEL: { bg: "#a855f7", border: "#9333ea", name: "Hotel" },
  FOOD: { bg: "#f59e0b", border: "#d97706", name: "Food" },
  SHOPPING: { bg: "#ec4899", border: "#db2777", name: "Shopping" },
  ENTERTAINMENT: { bg: "#10b981", border: "#059669", name: "Entertainment" },
  MISCELLANEOUS: { bg: "#64748b", border: "#475569", name: "Miscellaneous" },
};

export default function CategoryChart({ summaries }: CategoryChartProps) {
  const filteredSummaries = summaries.filter((s) => Number(s.totalAmount) > 0);

  if (filteredSummaries.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <span className="text-3xl">📊</span>
        <p className="mt-2 text-sm font-bold text-slate-700">No Expenses Recorded Yet</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Add expense entries to view the category spending breakdown chart.
        </p>
      </div>
    );
  }

  const labels = filteredSummaries.map(
    (s) => CATEGORY_COLORS[s.category]?.name || s.category
  );
  const dataValues = filteredSummaries.map((s) => Number(s.totalAmount));
  const bgColors = filteredSummaries.map(
    (s) => CATEGORY_COLORS[s.category]?.bg || "#64748b"
  );
  const borderColors = filteredSummaries.map(
    (s) => CATEGORY_COLORS[s.category]?.border || "#475569"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Spending",
        data: dataValues,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
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
          font: {
            size: 12,
            weight: "bold" as const,
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.parsed || 0;
            const formatted = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 2,
            }).format(val);
            return ` ${context.label}: ${formatted}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
}
