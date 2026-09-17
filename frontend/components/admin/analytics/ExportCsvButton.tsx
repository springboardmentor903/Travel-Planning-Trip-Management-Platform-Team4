"use client";

import React from "react";
import type { ComprehensiveAnalyticsResponse } from "../../../lib/types";

interface ExportCsvButtonProps {
  analytics: ComprehensiveAnalyticsResponse;
  timeRangeLabel?: string;
}

export default function ExportCsvButton({ analytics, timeRangeLabel = "Current Period" }: ExportCsvButtonProps) {
  const handleExport = () => {
    const lines: string[] = [];

    lines.push(`TripNest Admin Analytics Summary Report`);
    lines.push(`Generated At,${new Date().toISOString()}`);
    lines.push(`Time Range,${timeRangeLabel}`);
    lines.push(``);

    // KPI Metrics
    lines.push(`KPI METRICS`);
    lines.push(`Metric,Value`);
    lines.push(`Total Users,${analytics.kpi.totalUsers}`);
    lines.push(`New Users (Period),${analytics.kpi.newUsersThisMonth}`);
    lines.push(`Active Users,${analytics.kpi.activeUsers}`);
    lines.push(`Total Trips,${analytics.kpi.totalTrips}`);
    lines.push(`Trips (Period),${analytics.kpi.tripsThisMonth}`);
    lines.push(`Total Destinations,${analytics.kpi.totalDestinations}`);
    lines.push(`Active Destinations,${analytics.kpi.activeDestinations}`);
    lines.push(`Average Trip Budget ($),${analytics.kpi.averageTripBudget}`);
    lines.push(``);

    // Trip Status Breakdown
    lines.push(`TRIP STATUS DISTRIBUTION`);
    lines.push(`Status,Count`);
    lines.push(`Upcoming,${analytics.tripAnalytics.upcomingTrips}`);
    lines.push(`Ongoing,${analytics.tripAnalytics.ongoingTrips}`);
    lines.push(`Completed,${analytics.tripAnalytics.completedTrips}`);
    lines.push(`Cancelled,${analytics.tripAnalytics.cancelledTrips}`);
    lines.push(``);

    // Top Destinations
    lines.push(`TOP DESTINATIONS POPULARITY`);
    lines.push(`Destination ID,Destination Name,Trip Count,Percentage Share (%)`);
    analytics.destinationAnalytics.topDestinations.forEach((d: any) => {
      lines.push(`${d.destinationId},"${d.destinationName.replace(/"/g, '""')}",${d.tripCount},${d.percentageShare}%`);
    });
    lines.push(``);

    // Category Distribution
    lines.push(`DESTINATION CATEGORY DISTRIBUTION`);
    lines.push(`Category,Count,Percentage (%)`);
    analytics.destinationAnalytics.categoryDistribution.forEach((c: any) => {
      lines.push(`"${c.category.replace(/"/g, '""')}",${c.count},${c.percentage}%`);
    });
    lines.push(``);

    // Budget Distribution
    lines.push(`BUDGET RANGE DISTRIBUTION`);
    lines.push(`Range Bucket,Trip Count,Percentage (%)`);
    analytics.budgetAnalytics.rangeDistribution.forEach((b: any) => {
      lines.push(`"${b.rangeLabel}",${b.tripCount},${b.percentage}%`);
    });
    lines.push(``);

    // Date Metrics
    lines.push(`DATE & DURATION METRICS`);
    lines.push(`Average Trip Duration (Days),${analytics.dateAnalytics.averageTripDurationDays}`);

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(lines.join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `tripnest-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 hover:border-emerald-500/50"
    >
      <span className="text-sm">📥</span>
      Export Analytics CSV
    </button>
  );
}
