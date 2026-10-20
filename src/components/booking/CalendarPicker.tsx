"use client";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isPastLocalDay, todayKey } from "@/lib/dates";
import { useState } from "react";

export function CalendarPicker({ availableDays, selected, onSelect }: { availableDays: Set<string>; selected: string | null; onSelect: (value: string) => void }) {
  const selectedDate = selected ? new Date(`${selected}T12:00:00`) : new Date();
  const [month, setMonth] = useState(startOfMonth(selectedDate));
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  return <section className="calendar-picker" aria-label="Choose a date"><div className="calendar-month"><button type="button" aria-label="Previous month" onClick={() => setMonth(subMonths(month, 1))} className="month-nav"><ChevronLeft size={18}/></button><h4>{format(month, "MMMM yyyy")}</h4><button type="button" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} className="month-nav"><ChevronRight size={18}/></button></div><div className="calendar-grid"><div className="calendar-weekdays">{["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => <span key={d}>{d}</span>)}</div><div className="calendar-days">{days.map(day => { const key = format(day, "yyyy-MM-dd"); const past = isPastLocalDay(key); const enabled = availableDays.has(key) && !past; const active = key === selected; return <button type="button" key={key} disabled={!enabled} onClick={() => onSelect(key)} aria-pressed={active} aria-label={format(day, "MMMM d, yyyy")} className={`calendar-day${active ? " calendar-day-selected" : ""}${enabled ? " calendar-day-available" : ""}${!isSameMonth(day, month) ? " calendar-day-outside" : ""}`}>{format(day,"d")}{enabled && !active && <i className="calendar-day-dot"/>}</button>})}</div></div><p className="calendar-caption"><span className="calendar-legend-dot"/> Available dates</p></section>;
}
