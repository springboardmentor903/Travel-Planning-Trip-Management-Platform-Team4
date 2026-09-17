"use client";

import React from "react";
import Link from "next/link";

interface KpiCardsProps {
  kpi: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    totalTrips: number;
    tripsThisMonth: number;
    totalDestinations: number;
    activeDestinations: number;
    averageTripBudget: number;
  };
}

export default function KpiCards({ kpi }: KpiCardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: kpi.totalUsers.toLocaleString(),
      subtitle: "Registered user profiles",
      icon: "👥",
      badgeColor: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20",
      accentGradient: "from-indigo-500 to-indigo-700",
      href: "/admin/users",
      clickLabel: "Manage Users ➔",
    },
    {
      title: "New Users",
      value: kpi.newUsersThisMonth.toLocaleString(),
      subtitle: "Registered in selected period",
      icon: "✨",
      badgeColor: "bg-purple-500/10 text-purple-400 ring-purple-500/20",
      accentGradient: "from-purple-500 to-pink-500",
      href: "/admin/users?sortBy=createdAt&sortDir=DESC",
      clickLabel: "View Newest ➔",
    },
    {
      title: "Active Users",
      value: kpi.activeUsers.toLocaleString(),
      subtitle: "Active account status",
      icon: "🟢",
      badgeColor: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
      accentGradient: "from-emerald-500 to-teal-600",
      href: "/admin/users?status=ACTIVE",
      clickLabel: "View Active ➔",
    },
    {
      title: "Total Trips",
      value: kpi.totalTrips.toLocaleString(),
      subtitle: "Cumulative platform itineraries",
      icon: "✈️",
      badgeColor: "bg-blue-500/10 text-blue-400 ring-blue-500/20",
      accentGradient: "from-blue-500 to-cyan-500",
      href: "/admin/trips",
      clickLabel: "Manage Trips ➔",
    },
    {
      title: "Trips (Period)",
      value: kpi.tripsThisMonth.toLocaleString(),
      subtitle: "Created in selected period",
      icon: "📆",
      badgeColor: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
      accentGradient: "from-sky-500 to-blue-600",
      href: "/admin/trips?sortBy=createdAt&sortDir=DESC",
      clickLabel: "View Recent Trips ➔",
    },
    {
      title: "Total Destinations",
      value: kpi.totalDestinations.toLocaleString(),
      subtitle: "World travel destinations",
      icon: "🌍",
      badgeColor: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
      accentGradient: "from-amber-500 to-orange-600",
      href: "/admin/destinations",
      clickLabel: "Manage Catalog ➔",
    },
    {
      title: "Active Destinations",
      value: kpi.activeDestinations.toLocaleString(),
      subtitle: "Available for new trip planning",
      icon: "🏝️",
      badgeColor: "bg-teal-500/10 text-teal-400 ring-teal-500/20",
      accentGradient: "from-teal-500 to-emerald-600",
      href: "/admin/destinations?status=ACTIVE",
      clickLabel: "View Active ➔",
    },
    {
      title: "Avg Trip Budget",
      value: `$${kpi.averageTripBudget.toLocaleString()}`,
      subtitle: "Mean planned travel budget",
      icon: "💵",
      badgeColor: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
      accentGradient: "from-emerald-500 to-green-600",
      href: "/admin/trips?sortBy=budget&sortDir=DESC",
      clickLabel: "Inspect Budgets ➔",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <Link
          key={i}
          href={c.href}
          className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
              {c.title}
            </span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ring-1 ring-inset ${c.badgeColor} group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white sm:text-3xl font-mono group-hover:text-indigo-300 transition-colors">
              {c.value}
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-400">{c.subtitle}</span>
            <span className="font-extrabold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
              {c.clickLabel}
            </span>
          </div>

          <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${c.accentGradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
        </Link>
      ))}
    </div>
  );
}
