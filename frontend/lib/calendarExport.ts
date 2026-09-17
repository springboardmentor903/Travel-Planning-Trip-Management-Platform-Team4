import type { Activity, ItineraryDay, Trip } from "./types";

interface CalendarEventData {
  title: string;
  description?: string;
  location?: string;
  startDate?: string | null; // e.g. "2026-10-15" or ISO "2026-10-15T10:00:00"
  endDate?: string | null;
  startTime?: string | null; // e.g. "10:00" or ISO
  endTime?: string | null;
  isAllDay?: boolean;
}

/**
 * Formats a Date object or string into standard UTC iCal format: YYYYMMDDTHHmmssZ
 */
function formatToUtcIcal(dateStr?: string | null, timeStr?: string | null, defaultHour = 9): { utcStr: string; isAllDay: boolean } {
  if (!dateStr) {
    const d = new Date();
    return { utcStr: d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", isAllDay: false };
  }

  // If dateStr already includes time (e.g. 2026-10-15T10:00:00)
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { utcStr: d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", isAllDay: false };
    }
  }

  // Extract YYYY-MM-DD
  const pureDate = dateStr.split("T")[0];

  if (!timeStr) {
    // Treat as All Day event or construct 09:00 AM UTC
    const dateFormatted = pureDate.replace(/-/g, "");
    return { utcStr: dateFormatted, isAllDay: true };
  }

  // Pure time string like "10:00" or "10:00:00"
  const cleanTime = timeStr.includes("T") ? timeStr.split("T")[1] : timeStr;
  const timeParts = cleanTime.split(":");
  const hours = parseInt(timeParts[0] || String(defaultHour), 10);
  const minutes = parseInt(timeParts[1] || "0", 10);

  const fullDate = new Date(`${pureDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
  if (isNaN(fullDate.getTime())) {
    const dateFormatted = pureDate.replace(/-/g, "");
    return { utcStr: dateFormatted, isAllDay: true };
  }

  return { utcStr: fullDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", isAllDay: false };
}

/**
 * Escapes characters according to RFC 5545 iCalendar specification
 */
function escapeIcsText(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .trim();
}

/**
 * Generates a Google Calendar event creation URL
 */
export function buildGoogleCalendarUrl(event: CalendarEventData): string {
  const title = encodeURIComponent(event.title || "TripNest Activity");
  const details = encodeURIComponent(event.description || "Organized via TripNest Travel Planner");
  const location = encodeURIComponent(event.location || "");

  let datesParam = "";

  const startInfo = formatToUtcIcal(event.startDate, event.startTime, 9);
  
  if (startInfo.isAllDay) {
    // All day format: YYYYMMDD/YYYYMMDD
    const nextDay = new Date(event.startDate ? `${event.startDate.split("T")[0]}T00:00:00` : Date.now());
    nextDay.setDate(nextDay.getDate() + 1);
    const endFormatted = nextDay.toISOString().split("T")[0].replace(/-/g, "");
    datesParam = `${startInfo.utcStr}/${endFormatted}`;
  } else {
    // Timed event format: YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ
    let endInfo = formatToUtcIcal(event.endDate || event.startDate, event.endTime, 10);
    if (endInfo.isAllDay || endInfo.utcStr <= startInfo.utcStr) {
      // Default duration: 1 hour after start
      const stDate = new Date(event.startDate && event.startDate.includes("T") ? event.startDate : `${event.startDate?.split("T")[0]}T${event.startTime || "09:00"}:00`);
      if (!isNaN(stDate.getTime())) {
        stDate.setHours(stDate.getHours() + 1);
        endInfo = { utcStr: stDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", isAllDay: false };
      } else {
        endInfo = startInfo;
      }
    }
    datesParam = `${startInfo.utcStr}/${endInfo.utcStr}`;
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
}

/**
 * Generates a standard .ics calendar string containing one or multiple events
 */
export function generateIcsContent(events: CalendarEventData[]): string {
  const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  let csStr = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripNest//Travel Planner App//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n");

  events.forEach((evt, idx) => {
    const uid = `tripnest-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}@tripnest.com`;
    const startInfo = formatToUtcIcal(evt.startDate, evt.startTime, 9);
    
    let dtstartTag = "";
    let dtendTag = "";

    if (startInfo.isAllDay) {
      dtstartTag = `DTSTART;VALUE=DATE:${startInfo.utcStr}`;
      const nextDay = new Date(evt.startDate ? `${evt.startDate.split("T")[0]}T00:00:00` : Date.now());
      nextDay.setDate(nextDay.getDate() + 1);
      const endFormatted = nextDay.toISOString().split("T")[0].replace(/-/g, "");
      dtendTag = `DTEND;VALUE=DATE:${endFormatted}`;
    } else {
      dtstartTag = `DTSTART:${startInfo.utcStr}`;
      let endInfo = formatToUtcIcal(evt.endDate || evt.startDate, evt.endTime, 10);
      if (endInfo.isAllDay || endInfo.utcStr <= startInfo.utcStr) {
        const stDate = new Date(evt.startDate && evt.startDate.includes("T") ? evt.startDate : `${evt.startDate?.split("T")[0]}T${evt.startTime || "09:00"}:00`);
        if (!isNaN(stDate.getTime())) {
          stDate.setHours(stDate.getHours() + 1);
          endInfo = { utcStr: stDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", isAllDay: false };
        } else {
          endInfo = startInfo;
        }
      }
      dtendTag = `DTEND:${endInfo.utcStr}`;
    }

    const eventLines = [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      dtstartTag,
      dtendTag,
      `SUMMARY:${escapeIcsText(evt.title)}`,
      `DESCRIPTION:${escapeIcsText(evt.description || "TripNest Travel Activity")}`,
      `LOCATION:${escapeIcsText(evt.location || "")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ];

    csStr += "\r\n" + eventLines.join("\r\n");
  });

  csStr += "\r\nEND:VCALENDAR";
  return csStr;
}

/**
 * Triggers client-side download of an .ics file
 */
export function downloadIcsFile(filename: string, events: CalendarEventData[]): void {
  if (typeof window === "undefined" || events.length === 0) return;

  const content = generateIcsContent(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds calendar event objects from a single Activity
 */
export function activityToCalendarEvent(activity: Activity, trip: Trip, dayDate?: string | null): CalendarEventData {
  const eventDate = activity.startTime ? activity.startTime.split("T")[0] : dayDate || trip.startDate;
  
  let startTimeStr: string | null = null;
  let endTimeStr: string | null = null;

  if (activity.startTime) {
    startTimeStr = activity.startTime.includes("T") ? activity.startTime.split("T")[1] : activity.startTime;
  }
  if (activity.endTime) {
    endTimeStr = activity.endTime.includes("T") ? activity.endTime.split("T")[1] : activity.endTime;
  }

  return {
    title: `${activity.name} (${trip.title})`,
    description: activity.description ? `${activity.description}\n\nTrip: ${trip.title}` : `Activity in ${trip.title}`,
    location: activity.location || trip.destination?.name || "",
    startDate: eventDate,
    endDate: eventDate,
    startTime: startTimeStr,
    endTime: endTimeStr,
    isAllDay: !startTimeStr,
  };
}

/**
 * Builds calendar event objects from an ItineraryDay
 */
export function dayToCalendarEvents(day: ItineraryDay, trip: Trip): CalendarEventData[] {
  const dayDate = day.date || trip.startDate;
  
  if (day.activities && day.activities.length > 0) {
    return day.activities.map((act) => activityToCalendarEvent(act, trip, dayDate));
  }

  // Fallback day-level event
  return [
    {
      title: `Day ${day.dayNumber}: ${day.title} (${trip.title})`,
      description: day.description || `Itinerary Day ${day.dayNumber} for ${trip.title}`,
      location: trip.destination?.name || "",
      startDate: dayDate,
      endDate: dayDate,
      isAllDay: true,
    },
  ];
}

/**
 * Builds calendar event objects for an entire Trip
 */
export function tripToCalendarEvents(trip: Trip, days: ItineraryDay[]): CalendarEventData[] {
  const events: CalendarEventData[] = [];

  days.forEach((day) => {
    events.push(...dayToCalendarEvents(day, trip));
  });

  if (events.length === 0) {
    // Overall Trip Event fallback
    events.push({
      title: `Trip: ${trip.title} (📍 ${trip.destination?.name || "Destination"})`,
      description: trip.notes || `Travel Pass for ${trip.title} to ${trip.destination?.name || "Destination"}`,
      location: `${trip.destination?.name || ""}${trip.destination?.country ? `, ${trip.destination.country}` : ""}`,
      startDate: trip.startDate,
      endDate: trip.endDate,
      isAllDay: true,
    });
  }

  return events;
}
