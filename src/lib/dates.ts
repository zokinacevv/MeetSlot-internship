import { format, isBefore, startOfDay } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const DISPLAY_TIME_ZONE = "Europe/Skopje";

export class LocalTimeError extends Error {}

export function zonedDateTimeToUtc(date: string, time: string): Date {
  const localInput = new Date(`${date}T${time}:00`);
  if (Number.isNaN(localInput.getTime())) throw new LocalTimeError("The selected date or time is invalid.");
  const utc = fromZonedTime(localInput, DISPLAY_TIME_ZONE);
  const intended = `${date} ${time}`;
  if (formatInTimeZone(utc, DISPLAY_TIME_ZONE, "yyyy-MM-dd HH:mm") !== intended) {
    throw new LocalTimeError("This local time does not exist because of a daylight-saving change.");
  }
  for (let minute = -180; minute <= 180; minute += 15) {
    if (minute === 0) continue;
    const alternate = new Date(utc.getTime() + minute * 60_000);
    if (formatInTimeZone(alternate, DISPLAY_TIME_ZONE, "yyyy-MM-dd HH:mm") === intended) {
      throw new LocalTimeError("This local time is ambiguous because of a daylight-saving change. Please choose another time.");
    }
  }
  return utc;
}

export function isFuture(date: Date) { return date.getTime() > Date.now(); }
export function displayDate(date: string | Date) { return formatInTimeZone(date, DISPLAY_TIME_ZONE, "EEEE, MMMM d, yyyy"); }
export function displayTime(date: string | Date) { return formatInTimeZone(date, DISPLAY_TIME_ZONE, "HH:mm"); }
export function localDayKey(date: string | Date) { return formatInTimeZone(date, DISPLAY_TIME_ZONE, "yyyy-MM-dd"); }
export function todayKey() { return formatInTimeZone(new Date(), DISPLAY_TIME_ZONE, "yyyy-MM-dd"); }
export function isPastLocalDay(key: string) { return isBefore(startOfDay(new Date(`${key}T00:00:00`)), startOfDay(new Date(`${todayKey()}T00:00:00`))); }
export function dateInputValue(date: Date) { return format(date, "yyyy-MM-dd"); }
