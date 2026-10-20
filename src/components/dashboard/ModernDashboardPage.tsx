"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Plus,
  Trash2,
  Undo2,
  Users,
} from "lucide-react";
import { ModernPreviewHeader } from "@/components/layout/ModernPreviewHeader";
import { Notice } from "@/components/ui/Notice";
import { displayDate, displayTime, todayKey } from "@/lib/dates";
import type { ApiFailure, ApiSuccess, DashboardSlot } from "@/types";

export function ModernDashboardPage() {
  const [slots, setSlots] = useState<DashboardSlot[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [date, setDate] = useState(todayKey());
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [creating, setCreating] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    try {
      const response = await fetch("/api/dashboard/slots", { cache: "no-store" });
      const json = await response.json() as ApiSuccess<{ slots: DashboardSlot[] }> | ApiFailure;
      if (!response.ok || !json.success) throw new Error(json.success ? "Couldn't load appointments." : json.error.message);
      setSlots(json.data.slots);
    } catch (cause) {
      setSlots([]);
      setError(cause instanceof Error ? cause.message : "Couldn't load appointments.");
    }
  }

  useEffect(() => { void refresh(); }, []);

  const stats = useMemo(() => ({
    total: slots?.length ?? 0,
    available: slots?.filter((slot) => slot.status === "AVAILABLE").length ?? 0,
    booked: slots?.filter((slot) => slot.status === "BOOKED").length ?? 0,
  }), [slots]);

  async function createSlot(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime: time, durationMinutes: Number(duration) }),
      });
      const json = await response.json() as ApiSuccess<unknown> | ApiFailure;
      if (!response.ok || !json.success) throw new Error(json.success ? "Couldn't create the slot." : json.error.message);
      setMessage("Your new time is available for booking.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't create the slot.");
    } finally {
      setCreating(false);
    }
  }

  async function actOnSlot(slot: DashboardSlot) {
    const booked = slot.status === "BOOKED";
    const question = booked ? "Cancel this booking and release the time slot?" : "Delete this available slot?";
    if (!window.confirm(question)) return;
    setActing(slot.id);
    setError(null);
    setMessage(null);
    try {
      const url = booked ? `/api/bookings/${slot.booking?.id}/cancel` : `/api/slots/${slot.id}`;
      const response = await fetch(url, { method: booked ? "POST" : "DELETE" });
      const json = await response.json() as ApiSuccess<unknown> | ApiFailure;
      if (!response.ok || !json.success) throw new Error(json.success ? "That action couldn't be completed." : json.error.message);
      setMessage(booked ? "Booking canceled and time released." : "Available time removed.");
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "That action couldn't be completed.");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="modern-preview modern-dashboard-preview">
      <ModernPreviewHeader />
      <main className="modern-dashboard">
        <section className="modern-dashboard-intro">
          <div>
            <p className="modern-kicker">YOUR HOST SPACE</p>
            <h1>Keep your time <span>in good shape.</span></h1>
            <p>Publish open times, keep an eye on bookings, and make changes when plans move.</p>
          </div>
          <a href="#add-time" className="modern-primary-button">Add availability <Plus size={16} /></a>
        </section>

        <div className="modern-dashboard-note"><Users size={16} /><span>Challenge preview: this host dashboard has no login and is publicly accessible.</span></div>
        {error && <div className="modern-dashboard-alert"><Notice>{error}</Notice></div>}
        {message && <div className="modern-dashboard-alert"><Notice tone="success">{message}</Notice></div>}

        <section className="modern-stat-grid" aria-label="Appointment summary">
          <StatCard label="All time slots" value={stats.total} icon={<CalendarClock size={18} />} detail="Published or booked" />
          <StatCard label="Available" value={stats.available} icon={<CheckCircle2 size={18} />} detail="Ready for a guest" />
          <StatCard label="Booked" value={stats.booked} icon={<Users size={18} />} detail="With a guest" />
        </section>

        <section className="modern-add-card" id="add-time">
          <div className="modern-section-heading"><div className="modern-section-icon"><CalendarPlus size={18} /></div><div><p className="modern-kicker">OPEN UP YOUR CALENDAR</p><h2>Add an available time</h2></div></div>
          <form className="modern-slot-form" onSubmit={createSlot}>
            <label>Date<input type="date" min={todayKey()} required value={date} onChange={(event) => setDate(event.target.value)} /></label>
            <label>Start time<input type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label>
            <label>Length<select value={duration} onChange={(event) => setDuration(event.target.value)}>{[15, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>
            <button className="modern-primary-button" disabled={creating}>{creating ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} Publish time <ArrowUpRight size={15} /></button>
          </form>
        </section>

        <section className="modern-appointments-section">
          <div className="modern-appointments-heading"><div><p className="modern-kicker">YOUR SCHEDULE</p><h2>Upcoming times</h2></div><span>{slots?.length ?? 0} total</span></div>
          {slots === null ? <div className="modern-appointments-empty"><LoaderCircle className="animate-spin" /></div>
            : slots.length === 0 ? <div className="modern-appointments-empty"><CalendarClock size={25} /><p>No times are published yet.</p><a href="#add-time">Add your first time <ArrowUpRight size={14} /></a></div>
              : <div className="modern-slot-list">
                {slots.map((slot) => <article className="modern-slot-row" key={slot.id}>
                  <div className="modern-slot-date"><span>{displayDate(slot.startAt).split(",")[0]}</span><strong>{displayDate(slot.startAt).split(",")[1]?.trim()}</strong></div>
                  <div className="modern-slot-info"><strong>{displayTime(slot.startAt)} – {displayTime(slot.endAt)}</strong><span><Clock3 size={13} /> {slot.durationMinutes} min</span></div>
                  <div className={`modern-slot-status ${slot.status === "AVAILABLE" ? "status-available" : "status-booked"}`}><i />{slot.status === "AVAILABLE" ? "Available" : "Booked"}</div>
                  <div className="modern-slot-guest">{slot.booking ? <><strong>{slot.booking.guestName}</strong><span>{slot.booking.guestEmail}</span></> : <span className="guest-empty">Waiting for a booking</span>}</div>
                  <button className="modern-slot-action" disabled={acting === slot.id} aria-label={slot.status === "AVAILABLE" ? "Delete available time" : "Cancel booking"} onClick={() => void actOnSlot(slot)}>{acting === slot.id ? <LoaderCircle size={16} className="animate-spin" /> : slot.status === "AVAILABLE" ? <Trash2 size={16} /> : <Undo2 size={16} />}</button>
                </article>)}
              </div>}
        </section>
        <footer className="modern-dashboard-footer"><span>MeetSlot host space</span><span>Times are in Skopje local time</span></footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, detail }: { label: string; value: number; icon: React.ReactNode; detail: string }) {
  return <article className="modern-stat-card"><span className="modern-stat-icon">{icon}</span><span className="modern-stat-detail">{detail}</span><strong>{value}</strong><p>{label}</p></article>;
}
