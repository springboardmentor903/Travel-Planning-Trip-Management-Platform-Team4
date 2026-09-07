"use client";

import { useMemo, useState } from "react";
import type { Trip, ItineraryDay, Activity } from "../../lib/types";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2, X, Info, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type InsightType = "WARNING" | "SUGGESTION" | "INFO";

export interface SmartInsight {
  id: string;
  type: InsightType;
  title: string;
  message: string;
  dayNumber?: number;
}

export default function SmartTripInsights({
  trip,
  days,
}: {
  trip: Trip;
  days: ItineraryDay[];
}) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  // Dynamic Itinerary Analysis Engine
  const insights = useMemo(() => {
    const list: SmartInsight[] = [];

    if (!days || days.length === 0) {
      list.push({
        id: "empty-itinerary",
        type: "INFO",
        title: "Start Planning Your Days",
        message: "No itinerary days created yet. Use Smart Suggestions or add days manually to generate planning insights.",
      });
      return list;
    }

    let totalActivitiesCount = 0;
    const emptyDayNumbers: number[] = [];

    days.forEach((day) => {
      const activities = day.activities || [];
      totalActivitiesCount += activities.length;

      if (activities.length === 0) {
        emptyDayNumbers.push(day.dayNumber);
      }

      // 1. Overloaded Day Warning (>= 6 activities)
      if (activities.length >= 6) {
        list.push({
          id: `overloaded-day-${day.dayNumber}`,
          type: "WARNING",
          title: `Day ${day.dayNumber} is Overloaded`,
          message: `Day ${day.dayNumber} has ${activities.length} activities scheduled. Consider reducing activities for a comfortable pace.`,
          dayNumber: day.dayNumber,
        });
      }

      // 2. Time Conflicts (Overlapping times)
      const sortedActs = [...activities].sort((a, b) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      });

      for (let i = 0; i < sortedActs.length - 1; i++) {
        const actA = sortedActs[i];
        const actB = sortedActs[i + 1];

        if (actA.endTime && actB.startTime) {
          const endA = actA.endTime.includes("T") ? actA.endTime.split("T")[1] : actA.endTime;
          const startB = actB.startTime.includes("T") ? actB.startTime.split("T")[1] : actB.startTime;

          if (endA > startB) {
            list.push({
              id: `conflict-${day.dayNumber}-${i}`,
              type: "WARNING",
              title: `Time Conflict on Day ${day.dayNumber}`,
              message: `"${actA.name}" (${endA.slice(0, 5)}) overlaps with "${actB.name}" starting at ${startB.slice(0, 5)}.`,
              dayNumber: day.dayNumber,
            });
            break; // Max 1 conflict alert per day
          }
        }
      }

      // 3. Meal Break Suggestion (12:00 PM - 3:00 PM without dining)
      const middayActs = activities.filter((act) => {
        const time = act.startTime || "";
        const hour = parseInt(time.includes("T") ? time.split("T")[1] : time, 10);
        return !isNaN(hour) && hour >= 12 && hour <= 15;
      });

      const hasFoodBreak = middayActs.some((act) => {
        const name = (act.name || "").toLowerCase();
        const desc = (act.description || "").toLowerCase();
        return name.includes("lunch") || name.includes("food") || name.includes("dine") || name.includes("cafe") || desc.includes("restaurant");
      });

      if (middayActs.length >= 2 && !hasFoodBreak) {
        list.push({
          id: `meal-suggestion-${day.dayNumber}`,
          type: "SUGGESTION",
          title: `Meal Break Suggestion on Day ${day.dayNumber}`,
          message: `You have continuous activities scheduled between 12 PM and 3 PM without a lunch break.`,
          dayNumber: day.dayNumber,
        });
      }

      // 4. Category Concentration Suggestion (e.g., 3+ museums)
      const museumCount = activities.filter((act) => {
        const text = (act.name + " " + (act.description || "")).toLowerCase();
        return text.includes("museum") || text.includes("historic") || text.includes("monument");
      }).length;

      if (museumCount >= 3) {
        list.push({
          id: `balance-suggestion-${day.dayNumber}`,
          type: "SUGGESTION",
          title: `Pacing & Variety Suggestion`,
          message: `Day ${day.dayNumber} has many cultural visits. Consider adding an outdoor park or relaxation break.`,
          dayNumber: day.dayNumber,
        });
      }
    });

    // 5. Empty Day Alert
    if (emptyDayNumbers.length > 0) {
      list.push({
        id: "empty-days-alert",
        type: "SUGGESTION",
        title: "Unscheduled Days",
        message: `Day ${emptyDayNumbers.join(", ")} ${emptyDayNumbers.length === 1 ? "has" : "have"} no activities planned yet.`,
      });
    }

    // 6. Balanced Confirmation (if no warnings exist and total activities > 0)
    const hasWarnings = list.some((i) => i.type === "WARNING");
    if (!hasWarnings && totalActivitiesCount > 0) {
      list.unshift({
        id: "balanced-itinerary",
        type: "INFO",
        title: "Itinerary is Well Balanced",
        message: `Your planned activities across ${days.length} day${days.length === 1 ? "" : "s"} have comfortable timing and balanced pacing.`,
      });
    }

    // Sort by priority: WARNING (1) > SUGGESTION (2) > INFO (3)
    const priorityMap: Record<InsightType, number> = { WARNING: 1, SUGGESTION: 2, INFO: 3 };
    list.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

    // Cap at top 3 to 5 high-priority insights
    return list.slice(0, 4);
  }, [days, trip]);

  const activeInsights = insights.filter((item) => !dismissedIds.includes(item.id));

  if (activeInsights.length === 0) return null;

  const warningCount = activeInsights.filter((i) => i.type === "WARNING").length;

  return (
    <div className="mb-6 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-purple-50/30 to-white p-5 shadow-xs transition">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">✨ Smart Trip Insights</h3>
              {warningCount > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                  {warningCount} Warning{warningCount === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Real-time analysis of your travel schedule</p>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {/* Insights List */}
      {!collapsed && (
        <div className="mt-4 space-y-2.5">
          <AnimatePresence>
            {activeInsights.map((insight) => {
              const isWarning = insight.type === "WARNING";
              const isSuggestion = insight.type === "SUGGESTION";

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border text-xs transition ${
                    isWarning
                      ? "border-rose-200 bg-rose-50/90 text-rose-950"
                      : isSuggestion
                      ? "border-amber-200 bg-amber-50/90 text-amber-950"
                      : "border-indigo-100 bg-white/90 text-indigo-950"
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {isWarning ? (
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : isSuggestion ? (
                      <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-extrabold">{insight.title}</strong>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isWarning
                              ? "bg-rose-200 text-rose-900"
                              : isSuggestion
                              ? "bg-amber-200 text-amber-900"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">{insight.message}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setDismissedIds((prev) => [...prev, insight.id])}
                    className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
                    title="Dismiss insight"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
