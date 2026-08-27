export interface CalendarEventItem {
  id: string;
  title: string;
  companyName: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "16:00 - 17:00 (CET)" or "16:00"
  meetUrl?: string;
  interviewers?: string;
  notes?: string;
}

/**
 * Format a Date object to RFC 5545 / Google Calendar UTC string: YYYYMMDDTHHmmssZ
 */
export function formatToCalDate(dateStr: string, timeStr?: string, durationHours = 1): { start: string; end: string } {
  // Parse date
  const cleanDate = dateStr.trim();
  let [hours, minutes] = [12, 0];

  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
    }
  }

  // Create Date object (assuming local/CET)
  const [year, month, day] = cleanDate.split("-").map((n) => parseInt(n, 10));
  const startDate = new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, hours, minutes));
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const startIso = `${startDate.getUTCFullYear()}${pad(startDate.getUTCMonth() + 1)}${pad(
    startDate.getUTCDate()
  )}T${pad(startDate.getUTCHours())}${pad(startDate.getUTCMinutes())}00Z`;

  const endIso = `${endDate.getUTCFullYear()}${pad(endDate.getUTCMonth() + 1)}${pad(
    endDate.getUTCDate()
  )}T${pad(endDate.getUTCHours())}${pad(endDate.getUTCMinutes())}00Z`;

  return { start: startIso, end: endIso };
}

/**
 * Generate 1-click Google Calendar Add Event URL
 */
export function generateGoogleCalendarUrl(event: CalendarEventItem): string {
  const { start, end } = formatToCalDate(event.date, event.time);
  const title = `[HuntBoard] ${event.title} - ${event.companyName}`;

  const detailsArray = [
    `Stage: ${event.type}`,
    `Company: ${event.companyName}`,
    event.interviewers ? `Interviewers: ${event.interviewers}` : null,
    event.meetUrl ? `Meeting Link: ${event.meetUrl}` : null,
    event.notes ? `\nPreparation Notes:\n${event.notes}` : null,
    `\n---\nTracked in HuntBoard (https://huntboard.app)`,
  ].filter(Boolean);

  const details = detailsArray.join("\n");
  const location = event.meetUrl || event.companyName || "Online Meeting";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate standard RFC 5545 .ics text representation for events
 */
export function generateIcsContent(events: CalendarEventItem[]): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  const nowStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}00Z`;

  const vevents = events.map((ev) => {
    const { start, end } = formatToCalDate(ev.date, ev.time);
    const summary = `[HuntBoard] ${ev.title} (${ev.companyName})`;
    const location = ev.meetUrl || ev.companyName || "Remote Video Conference";
    const descLines = [
      `Interview Stage: ${ev.type}`,
      `Company: ${ev.companyName}`,
      ev.interviewers ? `Interviewers: ${ev.interviewers}` : "",
      ev.meetUrl ? `Video Link: ${ev.meetUrl}` : "",
      ev.notes ? `Notes: ${ev.notes}` : "",
    ]
      .filter(Boolean)
      .join("\\n");

    return [
      "BEGIN:VEVENT",
      `UID:${ev.id || crypto.randomUUID()}@huntboard.app`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${descLines}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HuntBoard//Interview Calendar Engine//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Client-side file downloader for .ics calendar files
 */
export function downloadIcsFile(filename: string, icsContent: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".ics") ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
