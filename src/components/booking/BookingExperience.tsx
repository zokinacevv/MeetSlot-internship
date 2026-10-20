"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { Notice } from "@/components/ui/Notice";
import { downloadCalendarInvite } from "@/lib/calendar-invite";
import { displayDate, displayTime, localDayKey } from "@/lib/dates";
import type { ApiFailure, ApiSuccess, PublicSlot } from "@/types";

type BookingResult = { id: string; guestName: string; guestEmail: string; slot: PublicSlot };

export function BookingExperience({ design = "cool" }: { design?: "cool" | "sunset" | "midnight" }) {
  const pageClass = design === "midnight" ? "home-page home-page-midnight" : design === "sunset" ? "home-page home-page-sunset" : "home-page";
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
      if (!response.ok || !json.success) {
        throw new Error(json.success ? "Unable to load availability." : json.error.message);
      }
      setSlots(json.data.slots);
      setSelectedDate((old) => old && json.data.slots.some((slot) => localDayKey(slot.startAt) === old)
        ? old
        : (json.data.slots[0] ? localDayKey(json.data.slots[0].startAt) : null));
    } catch (cause) {
      setSlots([]);
      setError(cause instanceof Error ? cause.message : "Unable to load availability.");
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

  const days = useMemo(() => new Set((slots ?? []).map((slot) => localDayKey(slot.startAt))), [slots]);
  const daySlots = useMemo(() => (slots ?? []).filter((slot) => localDayKey(slot.startAt) === selectedDate), [slots, selectedDate]);

  function chooseDate(value: string) {
    setSelectedDate(value);
    setSelectedSlot(null);
    setError(null);
  }

  async function submit(event: React.FormEvent) {
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
        throw new Error(json.success ? "Unable to make booking." : json.error.message);
      }
      setConfirmation(json.data.booking);
      setSelectedSlot(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to make booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <main className={pageClass}>
        <section className="confirmation-card">
          <div className="confirmation-icon"><CheckCircle2 size={34} strokeWidth={1.8} /></div>
          <p className="eyebrow">You’re all set</p>
          <h1>Your time is yours.</h1>
          <p className="confirmation-copy">{confirmationMessage ?? `We’ve reserved this time for ${confirmation.guestName}.`}</p>
          <div className="confirmation-details">
            <p><span>Booking reference</span><strong>{confirmation.id.slice(0, 8).toUpperCase()}</strong></p>
            <p><span>Date and time</span><strong>{displayDate(confirmation.slot.startAt)} · {displayTime(confirmation.slot.startAt)}–{displayTime(confirmation.slot.endAt)}</strong></p>
            <p><span>Confirmation sent to</span><strong>{confirmation.guestEmail}</strong></p>
          </div>
          <div className="confirmation-actions">
            <button
              className="button button-primary"
              onClick={() => downloadCalendarInvite({ bookingId: confirmation.id, startAt: confirmation.slot.startAt, endAt: confirmation.slot.endAt })}
            >
              <CalendarPlus size={17} /> Add to calendar
            </button>
            <button className="button button-quiet" onClick={() => { setConfirmation(null); setName(""); setEmail(""); }}>
              Book another time
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={pageClass}>
      <section className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-mark"><Sparkles size={13} /></span>{design === "midnight" ? "Less back-and-forth. More face-to-face." : "A little easier to meet"}</p>
          <h1>{design === "midnight" ? <>Make time for <em>what’s next.</em></> : <>Good things happen when we <em>make time.</em></>}</h1>
          <p className="hero-description">{design === "midnight" ? "A calmer way to get a meeting on the books. Pick a time, share your details, and leave the scheduling to us." : "Choose a time that works for you. A few details, one simple booking, and it’s in your calendar."}</p>

          <a className="hero-scroll-link" href="#booking"><span className="scroll-icon"><ArrowDownRight size={16} /></span> Find a time that works</a>

          <div className="hero-note">
            <div className="note-icon"><CalendarCheck2 size={19} /></div>
            <div><strong>{design === "midnight" ? "Your schedule, respected" : "Thoughtful scheduling"}</strong><span>Only genuinely available times are shown.</span></div>
          </div>

          <div className="hero-stamp" aria-hidden="true">
            <span className="stamp-orbit stamp-orbit-one" />
            <span className="stamp-orbit stamp-orbit-two" />
            <span className="stamp-dot" />
            <span className="stamp-label">{design === "midnight" ? <>make<br />time</> : <>meet<br />well</>}</span>
          </div>
        </div>

        <section className="booking-panel" id="booking" aria-labelledby="booking-title">
          <div className="booking-panel-heading">
            <div>
              <p className="booking-overline">{design === "midnight" ? "A few clicks, then it’s set" : "Let’s find a time"}</p>
              <h2 id="booking-title">{design === "midnight" ? "Choose your time" : "Book a meeting"}</h2>
            </div>
            <span className="booking-timezone"><span className="timezone-dot" /> Skopje local time</span>
          </div>

          <div className="booking-progress" aria-label="Booking steps">
            <span className="progress-step progress-active"><i>01</i> Date</span>
            <span className="progress-line" />
            <span className={selectedSlot ? "progress-step progress-active" : "progress-step"}><i>02</i> Time</span>
            <span className="progress-line" />
            <span className={selectedSlot ? "progress-step progress-active" : "progress-step"}><i>03</i> Details</span>
          </div>

          {error && <div className="booking-notice"><Notice>{error}{error.includes("no longer") && " Please choose another time."}</Notice></div>}

          <div className="booking-chooser">
            <div className="chooser-column calendar-column">
              <div className="step-heading"><span className="step-number">1</span><h3>Pick a date</h3></div>
              {slots === null ? <Loading /> : <CalendarPicker availableDays={days} selected={selectedDate} onSelect={chooseDate} />}
            </div>

            <div className="chooser-column time-column">
              <div className="step-heading"><span className="step-number">2</span><h3>Choose a time</h3></div>
              {slots === null ? <Loading compact /> : !selectedDate
                ? <Empty icon="calendar" text="No upcoming times are available just yet." />
                : daySlots.length === 0
                  ? <Empty icon="clock" text="No times on this date. Try another day." />
                  : <div className="time-list" role="list" aria-label="Available times">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        aria-pressed={selectedSlot?.id === slot.id}
                        onClick={() => { setSelectedSlot(slot); setError(null); }}
                        className={`time-option${selectedSlot?.id === slot.id ? " time-option-selected" : ""}`}
                      >
                        <span className="time-option-main">{displayTime(slot.startAt)}<small>{slot.durationMinutes} min</small></span>
                        <span className="time-option-check">{selectedSlot?.id === slot.id ? <Check size={15} /> : <ArrowDownRight size={15} />}</span>
                      </button>
                    ))}
                  </div>}
            </div>
          </div>

          <div className={`booking-details${selectedSlot ? " booking-details-open" : ""}`}>
            <div className="step-heading details-step-heading"><span className="step-number">3</span><h3>Your details</h3></div>
            {!selectedSlot
              ? <p className="details-prompt"><UserRound size={16} /> Choose an available time to add your details.</p>
              : <form className="booking-form" onSubmit={submit}>
                <label>Full name<input required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="field" placeholder="Your name" /></label>
                <label>Email address<input required type="email" maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="field" placeholder="you@example.com" /></label>
                <div className="booking-submit-wrap">
                  <p className="selected-time-summary"><Clock3 size={14} /> {displayDate(selectedSlot.startAt)}, {displayTime(selectedSlot.startAt)}</p>
                  <button disabled={submitting} className="button button-primary booking-submit">
                    {submitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
                    Confirm booking <ArrowDownRight size={16} />
                  </button>
                </div>
              </form>}
          </div>

          <p className="booking-footnote"><span><Check size={13} /></span> No account needed · Calendar conflicts are checked automatically</p>
        </section>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <div className="how-heading">
          <p className="eyebrow">{design === "midnight" ? "A better kind of scheduling" : "A good use of everyone’s time"}</p>
          <h2 id="how-title">{design === "midnight" ? <>Less planning. More <em>being there.</em></> : <>From “when works?” to <em>it’s booked.</em></>}</h2>
        </div>
        <div className="how-steps">
          <article className="how-step"><span className="how-number">01</span><h3>Find your moment</h3><p>Browse the dates and times that are actually open.</p></article>
          <article className="how-step"><span className="how-number">02</span><h3>Make it yours</h3><p>Share your name and email to reserve your chosen time.</p></article>
          <article className="how-step"><span className="how-number">03</span><h3>Keep it close</h3><p>Add the meeting to your calendar with one click.</p></article>
        </div>
      </section>
      <footer className="home-footer"><span className="footer-brand">meet<span>slot</span></span><span>Make room for a good conversation.</span></footer>
    </main>
  );
}

function Loading({ compact = false }: { compact?: boolean }) {
  return <div className={`booking-loading${compact ? " booking-loading-compact" : ""}`}><LoaderCircle className="animate-spin" size={18} /> Loading available times…</div>;
}

function Empty({ icon, text }: { icon: "calendar" | "clock"; text: string }) {
  const Icon = icon === "calendar" ? CalendarDays : Clock3;
  return <div className="empty-times"><Icon size={21} /><span>{text}</span></div>;
}
