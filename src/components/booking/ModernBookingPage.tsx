"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { Notice } from "@/components/ui/Notice";
import { ModernPreviewHeader } from "@/components/layout/ModernPreviewHeader";
import { downloadCalendarInvite } from "@/lib/calendar-invite";
import { displayDate, displayTime, localDayKey } from "@/lib/dates";
import type { ApiFailure, ApiSuccess, PublicSlot } from "@/types";

type BookingResult = { id: string; guestName: string; guestEmail: string; slot: PublicSlot };

export function ModernBookingPage() {
  const [slots, setSlots] = useState<PublicSlot[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingResult | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  async function refresh() {
    setSlots(null);
    setError(null);
    try {
      const response = await fetch("/api/slots", { cache: "no-store" });
      const json = await response.json() as ApiSuccess<{ slots: PublicSlot[] }> | ApiFailure;
      if (!response.ok || !json.success) throw new Error(json.success ? "Couldn't load availability." : json.error.message);
      setSlots(json.data.slots);
      setSelectedDate((old) => old && json.data.slots.some((slot) => localDayKey(slot.startAt) === old)
        ? old
        : (json.data.slots[0] ? localDayKey(json.data.slots[0].startAt) : null));
    } catch (cause) {
      setSlots([]);
      setError(cause instanceof Error ? cause.message : "Couldn't load availability.");
    }
  }

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!confirmation) return;
    setConfirmationMessage(null);
    void fetch("/api/ai/confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: confirmation.id }),
    })
      .then(async (response) => response.json() as Promise<ApiSuccess<{ message: string }> | ApiFailure>)
      .then((json) => { if (json.success) setConfirmationMessage(json.data.message); })
      .catch(() => undefined);
  }, [confirmation]);

  const availableDays = useMemo(() => new Set((slots ?? []).map((slot) => localDayKey(slot.startAt))), [slots]);
  const daySlots = useMemo(() => (slots ?? []).filter((slot) => localDayKey(slot.startAt) === selectedDate), [slots, selectedDate]);

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlot.id, guestName: name, guestEmail: email }),
      });
      const json = await response.json() as ApiSuccess<{ booking: BookingResult }> | ApiFailure;
      if (!response.ok || !json.success) {
        if (response.status === 409) {
          setSelectedSlot(null);
          await refresh();
        }
        throw new Error(json.success ? "Couldn't complete this booking." : json.error.message);
      }
      setConfirmation(json.data.booking);
      setSelectedSlot(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't complete this booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="modern-preview">
        <ModernPreviewHeader />
        <main className="modern-confirmation-wrap">
          <section className="modern-confirmation-card">
            <span className="modern-confirmation-icon"><CheckCircle2 size={32} /></span>
            <p className="modern-kicker">IT'S OFFICIAL</p>
            <h1>You’re on the calendar.</h1>
            <p className="modern-confirmation-message">{confirmationMessage ?? `We’ve saved your time, ${confirmation.guestName}.`}</p>
            <div className="modern-confirmation-details">
              <div><span>DATE</span><strong>{displayDate(confirmation.slot.startAt)}</strong></div>
              <div><span>TIME · SKOPJE</span><strong>{displayTime(confirmation.slot.startAt)} – {displayTime(confirmation.slot.endAt)}</strong></div>
              <div><span>EMAIL</span><strong>{confirmation.guestEmail}</strong></div>
              <div><span>REFERENCE</span><strong>{confirmation.id.slice(0, 8).toUpperCase()}</strong></div>
            </div>
            <div className="modern-confirmation-actions">
              <button className="modern-primary-button" onClick={() => downloadCalendarInvite({ bookingId: confirmation.id, startAt: confirmation.slot.startAt, endAt: confirmation.slot.endAt })}><CalendarPlus size={17} /> Add to calendar <ArrowRight size={16} /></button>
              <button className="modern-secondary-button" onClick={() => { setConfirmation(null); setName(""); setEmail(""); }}>Book another time</button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="modern-preview">
      <ModernPreviewHeader />
      <main>
        <section className="modern-hero">
          <div className="modern-hero-copy">
            <p className="modern-kicker"><span className="modern-kicker-icon"><Sparkles size={14} /></span> BETTER MEETINGS START WITH LESS BACK-AND-FORTH</p>
            <h1>Make space for <span>what matters.</span></h1>
            <p className="modern-hero-lede">A meeting should start with a good conversation, not a long email thread. Find a time that works and get on with your day.</p>
            <a className="modern-hero-cta" href="#modern-booking">Find your time <ArrowRight size={16} /></a>
            <div className="modern-points">
              <span><Check size={14} /> No account needed</span>
              <span><Check size={14} /> Calendar-aware availability</span>
            </div>
            <div className="modern-timezone-note"><span className="modern-timezone-icon"><Clock3 size={17} /></span><span><strong>All times follow Skopje local time</strong><small>Your calendar handles the rest.</small></span></div>
          </div>

          <section className="modern-schedule" id="modern-booking" aria-labelledby="modern-booking-title">
            <div className="modern-schedule-head">
              <div className="modern-schedule-label"><span className="modern-live-dot" /> LIVE AVAILABILITY</div>
              <h2 id="modern-booking-title">Find a time that fits.</h2>
              <p>Choose a date first, then pick a time.</p>
            </div>
            {error && <div className="modern-error"><Notice>{error}</Notice></div>}
            <div className="modern-schedule-grid">
              <div className="modern-calendar-pane">
                <div className="modern-pane-title"><span>01</span><h3>Select a date</h3></div>
                {slots === null ? <div className="modern-loading"><LoaderCircle className="animate-spin" size={20} /> Loading availability</div>
                  : <CalendarPicker availableDays={availableDays} selected={selectedDate} onSelect={(date) => { setSelectedDate(date); setSelectedSlot(null); setError(null); }} />}
              </div>
              <div className="modern-times-pane">
                <div className="modern-pane-title"><span>02</span><h3>Available times</h3></div>
                {slots === null ? <div className="modern-loading"><LoaderCircle className="animate-spin" size={20} /></div>
                  : !selectedDate ? <div className="modern-empty"><CalendarDays size={21} /><span>No upcoming times yet.</span></div>
                    : daySlots.length === 0 ? <div className="modern-empty"><Clock3 size={21} /><span>No times on this date. Pick another day.</span></div>
                      : <div className="modern-time-options" aria-label="Available times">
                        {daySlots.map((slot) => <button type="button" key={slot.id} aria-pressed={selectedSlot?.id === slot.id} onClick={() => { setSelectedSlot(slot); setError(null); }} className={`modern-time-button${selectedSlot?.id === slot.id ? " modern-time-button-active" : ""}`}><span><strong>{displayTime(slot.startAt)}</strong><small>{slot.durationMinutes} min</small></span><ArrowRight size={16} /></button>)}
                      </div>}
              </div>
            </div>
            <div className="modern-details-pane">
              <div className="modern-pane-title"><span>03</span><h3>Your details</h3></div>
              {!selectedSlot ? <p className="modern-details-hint"><UserRound size={15} /> Pick a time to continue. Your details stay private.</p>
                : <form className="modern-booking-form" onSubmit={submitBooking}>
                  <label>Your name<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" /></label>
                  <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
                  <div className="modern-submit-cell"><span><Clock3 size={14} /> {displayDate(selectedSlot.startAt)}, {displayTime(selectedSlot.startAt)}</span><button className="modern-primary-button" disabled={submitting}>{submitting ? <LoaderCircle size={16} className="animate-spin" /> : null} Confirm booking <ArrowRight size={16} /></button></div>
                </form>}
            </div>
            <div className="modern-schedule-foot"><span><ShieldCheck size={14} /> Existing calendar events are respected</span><span>Skopje local time</span></div>
          </section>
        </section>

        <section className="modern-how" id="how-it-works" aria-labelledby="modern-how-title">
          <div className="modern-how-heading"><p className="modern-kicker">THREE STEPS. THAT’S IT.</p><h2 id="modern-how-title">A little less scheduling.<br /><span>A lot more doing.</span></h2></div>
          <div className="modern-how-cards">
            <article><span>01</span><CalendarDays size={20} /><h3>Choose a day</h3><p>See the dates with open time on the calendar.</p></article>
            <article><span>02</span><Clock3 size={20} /><h3>Pick a slot</h3><p>Select a time that fits your schedule.</p></article>
            <article><span>03</span><CalendarCheck2 size={20} /><h3>You're booked</h3><p>Confirm your details and add it to your calendar.</p></article>
          </div>
        </section>
        <footer className="modern-footer"><Link href="/" className="modern-brand"><span className="modern-brand-icon"><CalendarCheck2 size={17} /></span><span>meet<span>slot</span></span></Link><span>Make time for a good conversation.</span><span>Europe/Skopje</span></footer>
      </main>
    </div>
  );
}
