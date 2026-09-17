import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Expense, ItineraryDay, RemainingBudget, Trip } from "./types";

export function generateTravelPassPDF(
  trip: Trip,
  days: ItineraryDay[],
  expenses: Expense[],
  remainingBudget: RemainingBudget | null,
  user?: { name?: string; email?: string } | null
): void {
  if (typeof window === "undefined") return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor: [number, number, number] = [30, 27, 75]; // Indigo-950 #1e1b4b
  const accentColor: [number, number, number] = [79, 70, 229]; // Indigo-600 #4f46e5
  const secondaryColor: [number, number, number] = [100, 116, 139]; // Slate-500 #64748b
  const bgLight: [number, number, number] = [248, 250, 252]; // Slate-50 #f8fafc
  const borderColor: [number, number, number] = [226, 232, 240]; // Slate-200 #e2e8f0
  const textDark: [number, number, number] = [15, 23, 42]; // Slate-900 #0f172a

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateStr = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(`${dateStr.split("T")[0]}T00:00:00`);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = (start?: string, end?: string) => {
    if (!start || !end) return 1;
    try {
      const s = new Date(`${start.split("T")[0]}T00:00:00`);
      const e = new Date(`${end.split("T")[0]}T00:00:00`);
      const diff = Math.abs(e.getTime() - s.getTime());
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    } catch {
      return 1;
    }
  };

  const travelerName = user?.name || trip.userEmail || "TripNest Member";
  const travelerEmail = user?.email || trip.userEmail || "N/A";
  const passId = `TP-${trip.id}-${String(trip.createdAt || Date.now()).slice(-6)}`;
  const issueDate = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const durationDays = calculateDays(trip.startDate, trip.endDate);

  // ==========================================
  // PAGE 1: TRAVEL PASS & TRIP OVERVIEW
  // ==========================================

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Header Logo & Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TRIPNEST", margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254); // Indigo-200
  doc.text("OFFICIAL TRAVEL PASS & TRIP ITINERARY", margin, 26);

  // Pass Reference Pill
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 55, 12, 55, 18, 3, 3, "F");
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("PASS ID", pageWidth - margin - 50, 18);
  doc.setFontSize(10);
  doc.text(passId, pageWidth - margin - 50, 25);

  let currentY = 52;

  // Section 1: Traveler & Pass Details Header
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, 38, 4, 4, "FD");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TRAVELPASS INFORMATION", margin + 6, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...secondaryColor);

  doc.text(`Primary Traveler:`, margin + 6, currentY + 18);
  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.text(travelerName, margin + 36, currentY + 18);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  doc.text(`Contact Email:`, margin + 6, currentY + 25);
  doc.setTextColor(...textDark);
  doc.text(travelerEmail, margin + 36, currentY + 25);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  doc.text(`Issue Date:`, margin + 110, currentY + 18);
  doc.setTextColor(...textDark);
  doc.text(issueDate, margin + 135, currentY + 18);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...secondaryColor);
  doc.text(`Pass Status:`, margin + 110, currentY + 25);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("helvetica", "bold");
  doc.text("CONFIRMED / ACTIVE", margin + 135, currentY + 25);

  currentY += 46;

  // Section 2: Key Trip Details Grid
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...primaryColor);
  doc.text("TRIP SPECIFICATIONS", margin, currentY);

  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Field", "Details", "Field", "Details"]],
    body: [
      ["Trip Name", trip.title || "Unnamed Trip", "Destination", trip.destination?.name || "Unspecified"],
      ["Country", trip.destination?.country || "N/A", "City/Region", trip.destination?.city || "N/A"],
      ["Start Date", formatDateStr(trip.startDate), "End Date", formatDateStr(trip.endDate)],
      ["Duration", `${durationDays} Day${durationDays > 1 ? "s" : ""}`, "Status", trip.status || "PLANNED"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: accentColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 9,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35, fillColor: bgLight },
      1: { cellWidth: 55 },
      2: { fontStyle: "bold", cellWidth: 35, fillColor: bgLight },
      3: { cellWidth: 55 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Section 3: Destination Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("DESTINATION OVERVIEW", margin, currentY);

  currentY += 4;

  const destDesc = trip.destination?.description || "No official description recorded for this destination.";
  const destCategory = trip.destination?.category || "Travel Destination";
  const destLocation = trip.destination?.location || `${trip.destination?.name || "Location"}, ${trip.destination?.country || ""}`;

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, 30, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text(`Category: ${destCategory} • Location: ${destLocation}`, margin + 6, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const splitDesc = doc.splitTextToSize(destDesc, contentWidth - 12);
  doc.text(splitDesc.slice(0, 3), margin + 6, currentY + 15);

  currentY += 38;

  // Section 4: Accommodation / Hotel Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("ACCOMMODATION & LODGING", margin, currentY);

  currentY += 4;

  const hotelExpenses = expenses.filter((e) => e.category === "HOTEL");
  const hotelInfo = hotelExpenses.length > 0
    ? hotelExpenses.map((h) => `${h.payerName || "Hotel/Resort"}: ${formatCurrency(h.amount)} (${formatDateStr(h.date)})`).join("; ")
    : "No hotel reservations logged under expenses. Check itinerary details for lodging notes.";

  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const splitHotel = doc.splitTextToSize(`Lodging Summary: ${hotelInfo}`, contentWidth - 12);
  doc.text(splitHotel.slice(0, 2), margin + 6, currentY + 9);

  currentY += 30;

  // Section 5: Emergency Contacts & Important Helpline
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("EMERGENCY & HELPLINE CONTACTS", margin, currentY);

  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Service", "Number / Contact", "Availability"]],
    body: [
      ["Local Emergency (Police/Ambulance)", "112 / 911", "24/7 Toll-Free"],
      ["Tourist Helpline", "+1-800-TRIPNEST", "24/7 Customer Support"],
      ["Destination Support", `${trip.destination?.name || "Local"} Tourist Information Center`, "09:00 AM - 06:00 PM"],
      ["Primary Contact", `${travelerName} (${travelerEmail})`, "Personal Contact"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 8,
    },
  });

  // Footer for Page 1
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text("TripNest Travel Pass • Page 1 of 2 • Generated Client-Side locally", margin, pageHeight - 10);
  doc.text(`Document Ref: ${passId}`, pageWidth - margin - 45, pageHeight - 10);

  // ==========================================
  // PAGE 2: DAILY ITINERARY & BUDGET SUMMARY
  // ==========================================
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`TRIPNEST — ${trip.title.toUpperCase()}`, margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text("DAILY ITINERARY SCHEDULE & FINANCIAL BREAKDOWN", pageWidth - margin - 85, 15);

  currentY = 32;

  // Section 1: Daily Itinerary Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("DAILY ITINERARY SCHEDULE", margin, currentY);

  currentY += 4;

  const itineraryRows: string[][] = [];
  if (days.length === 0) {
    itineraryRows.push(["General", formatDateStr(trip.startDate), "All Day", `Explore ${trip.destination?.name || "destination"}`, trip.destination?.name || "N/A"]);
  } else {
    days.forEach((day) => {
      const dayDate = day.date ? formatDateStr(day.date) : `Day ${day.dayNumber}`;
      if (!day.activities || day.activities.length === 0) {
        itineraryRows.push([
          `Day ${day.dayNumber}`,
          dayDate,
          "Full Day",
          `${day.title}${day.description ? `: ${day.description}` : ""}`,
          trip.destination?.name || "N/A",
        ]);
      } else {
        day.activities.forEach((act) => {
          let timeDisplay = "Flexible";
          if (act.startTime) {
            try {
              const st = new Date(act.startTime);
              timeDisplay = isNaN(st.getTime()) ? act.startTime : st.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            } catch {
              timeDisplay = act.startTime;
            }
          }
          itineraryRows.push([
            `Day ${day.dayNumber}`,
            dayDate,
            timeDisplay,
            `${act.name}${act.description ? ` (${act.description})` : ""}`,
            act.location || trip.destination?.name || "N/A",
          ]);
        });
      }
    });
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Day", "Date", "Time", "Activity / Schedule", "Location"]],
    body: itineraryRows,
    theme: "grid",
    headStyles: {
      fillColor: accentColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 8,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 20 },
      1: { cellWidth: 25 },
      2: { cellWidth: 22 },
      3: { cellWidth: 78 },
      4: { cellWidth: 35 },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check if page length exceeded
  if (currentY > pageHeight - 75) {
    doc.addPage();
    currentY = 25;
  }

  // Section 2: Financial & Budget Breakdown
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text("FINANCIAL & BUDGET BREAKDOWN", margin, currentY);

  currentY += 4;

  const totalBudget = remainingBudget ? remainingBudget.totalBudget : Number(trip.budget || 0);
  const totalSpent = remainingBudget ? remainingBudget.totalExpenses : expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const remaining = remainingBudget ? remainingBudget.remainingBudget : totalBudget - totalSpent;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [["Metric", "Amount (INR)", "Status / Notes"]],
    body: [
      ["Total Allocated Budget", formatCurrency(totalBudget), "Trip Target"],
      ["Total Recorded Expenses", formatCurrency(totalSpent), `${expenses.length} Receipts Logged`],
      ["Remaining Available Funds", formatCurrency(remaining), remaining < 0 ? "EXCEEDED BUDGET" : "Within Budget Target"],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 8.5,
      fontStyle: "bold",
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check if page space is available
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 25;
  }

  // Section 3: Notes & Packing Checklist
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text("IMPORTANT TRAVEL NOTES", margin, currentY);

  currentY += 4;

  const travelNotes = trip.notes && trip.notes.trim() ? trip.notes.trim() : "No special notes recorded. Always carry valid ID and emergency contacts.";
  
  doc.setFillColor(...bgLight);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, contentWidth / 2 - 4, 30, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  const splitNotes = doc.splitTextToSize(travelNotes, contentWidth / 2 - 12);
  doc.text(splitNotes.slice(0, 4), margin + 4, currentY + 7);

  // Packing Checklist
  const rightX = margin + contentWidth / 2 + 4;
  doc.roundedRect(rightX, currentY, contentWidth / 2 - 4, 30, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accentColor);
  doc.text("ESSENTIAL PACKING SUMMARY", rightX + 4, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text("[x] Passport / Government Photo ID & Travel Pass", rightX + 4, currentY + 13);
  doc.text("[x] Mobile Devices, Chargers & Power Adapter", rightX + 4, currentY + 18);
  doc.text("[x] Medicines, First-Aid & Essential Toiletries", rightX + 4, currentY + 23);
  doc.text("[x] Credit Cards, Debit Cards & Local Currency", rightX + 4, currentY + 27);

  // Footer for Page 2
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text("TripNest Travel Pass • Page 2 of 2 • Official Document", margin, pageHeight - 10);
  doc.text(`Pass ID: ${passId}`, pageWidth - margin - 45, pageHeight - 10);

  // Save PDF file
  const fileName = `${trip.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_TravelPass.pdf`;
  doc.save(fileName);
}
