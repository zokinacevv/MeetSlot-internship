import { describe, expect, it } from "vitest";
import { createCalendarInvite } from "@/lib/calendar-invite";

describe("calendar invite", () => {
  it("creates a portable UTC iCalendar event", () => {
    const invite = createCalendarInvite({ bookingId: "01d8b7b6-42b1-4c3c-8706-9535c488d19a", startAt: "2026-10-21T08:00:00.000Z", endAt: "2026-10-21T08:30:00.000Z" });
    expect(invite).toContain("BEGIN:VCALENDAR");
    expect(invite).toContain("DTSTART:20261021T080000Z");
    expect(invite).toContain("DTEND:20261021T083000Z");
    expect(invite).toContain("UID:01d8b7b6-42b1-4c3c-8706-9535c488d19a@meetslot");
  });
});
