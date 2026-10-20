import { google } from "googleapis";
import { fromZonedTime } from "date-fns-tz";
import { DISPLAY_TIME_ZONE } from "@/lib/dates";

export type TimeRange = { startAt: Date; endAt: Date };
export class CalendarConflictError extends Error {}
export class CalendarUnavailableError extends Error {}

function configuration() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  return clientId && clientSecret && refreshToken ? { clientId, clientSecret, refreshToken, calendarId: process.env.GOOGLE_CALENDAR_ID || "primary" } : null;
}

export function isCalendarConnected() { return configuration() !== null; }
export function intervalsOverlap(a: TimeRange, b: TimeRange) { return a.startAt < b.endAt && a.endAt > b.startAt; }

function eventDate(value: { dateTime?: string | null; date?: string | null } | undefined) {
  if (!value) return null;
  if (value.dateTime) return new Date(value.dateTime);
  if (value.date) return fromZonedTime(`${value.date}T00:00:00`, DISPLAY_TIME_ZONE);
  return null;
}

export async function calendarBusyRanges(range: TimeRange): Promise<TimeRange[]> {
  const config = configuration();
  if (!config) return [];
  try {
    const auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
    auth.setCredentials({ refresh_token: config.refreshToken });
    const calendar = google.calendar({ version: "v3", auth });
    const response = await calendar.events.list({
      calendarId: config.calendarId,
      timeMin: range.startAt.toISOString(), timeMax: range.endAt.toISOString(),
      singleEvents: true, showDeleted: false, orderBy: "startTime", maxResults: 2500,
      fields: "items(status,transparency,start,end)"
    });
    return (response.data.items ?? []).flatMap((event) => {
      if (event.status === "cancelled" || event.transparency === "transparent") return [];
      const startAt = eventDate(event.start); const endAt = eventDate(event.end);
      return startAt && endAt && startAt < endAt ? [{ startAt, endAt }] : [];
    });
  } catch {
    throw new CalendarUnavailableError("Google Calendar could not be checked. Please try again shortly.");
  }
}

export async function assertNoCalendarConflict(slot: TimeRange) {
  if (!isCalendarConnected()) return;
  const busy = await calendarBusyRanges(slot);
  if (busy.some((event) => intervalsOverlap(slot, event))) throw new CalendarConflictError("This time conflicts with an event in Google Calendar.");
}

export async function filterCalendarConflicts<T extends TimeRange>(slots: T[]) {
  if (!isCalendarConnected() || slots.length === 0) return slots;
  const busy = await calendarBusyRanges({ startAt: slots[0].startAt, endAt: slots[slots.length - 1].endAt });
  return slots.filter((slot) => !busy.some((event) => intervalsOverlap(slot, event)));
}
