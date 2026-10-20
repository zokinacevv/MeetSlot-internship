import { formatInTimeZone } from "date-fns-tz";

type CalendarInvite = {
  bookingId: string;
  startAt: string;
  endAt: string;
};

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function utcStamp(value: Date | string) {
  return formatInTimeZone(value, "UTC", "yyyyMMdd'T'HHmmss'Z'");
}

export function createCalendarInvite({ bookingId, startAt, endAt }: CalendarInvite) {
  const reference = bookingId.slice(0, 8).toUpperCase();
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeetSlot//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${bookingId}@meetslot`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(startAt)}`,
    `DTEND:${utcStamp(endAt)}`,
    `SUMMARY:${escapeIcsText("MeetSlot meeting")}`,
    `DESCRIPTION:${escapeIcsText(`Meeting booked through MeetSlot. Reference: ${reference}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadCalendarInvite(invite: CalendarInvite) {
  const blob = new Blob([createCalendarInvite(invite)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `meetslot-${invite.bookingId.slice(0, 8)}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
