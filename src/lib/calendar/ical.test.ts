import { describe, it, expect } from "vitest";
import {
  formatToCalDate,
  generateGoogleCalendarUrl,
  generateIcsContent,
  CalendarEventItem,
} from "./ical";

describe("Calendar & iCal engine", () => {
  const sampleEvent: CalendarEventItem = {
    id: "ev-test-1",
    title: "System Design Interview",
    companyName: "Stripe",
    type: "Technical Interview",
    date: "2026-08-30",
    time: "16:00 - 17:00 (CET)",
    meetUrl: "https://meet.google.com/abc-defg",
    interviewers: "Alex & Emma",
    notes: "Review distributed caching and high-availability PostgreSQL.",
  };

  it("formats date and time to valid ISO UTC strings", () => {
    const { start, end } = formatToCalDate("2026-08-30", "16:00");
    expect(start).toBe("20260830T160000Z");
    expect(end).toBe("20260830T170000Z");
  });

  it("generates a valid Google Calendar 1-click web URL", () => {
    const url = generateGoogleCalendarUrl(sampleEvent);
    expect(url).toContain("https://calendar.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain("Stripe");
    expect(url).toContain("System+Design+Interview");
    expect(url).toContain("https%3A%2F%2Fmeet.google.com%2Fabc-defg");
  });

  it("generates standard RFC 5545 .ics content", () => {
    const ics = generateIcsContent([sampleEvent]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:[HuntBoard] System Design Interview (Stripe)");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });
});
