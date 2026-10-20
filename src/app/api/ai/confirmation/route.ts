import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { displayDate, displayTime } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { idSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || !idSchema.safeParse(body.bookingId).success) return failure("VALIDATION_ERROR", "Invalid booking ID.");
  const booking = await prisma.booking.findUnique({ where: { id: body.bookingId }, include: { slot: true } });
  if (!booking) return failure("BOOKING_NOT_FOUND", "Booking not found.", 404);
  const fallback = `Hi ${booking.guestName}! Your meeting is confirmed for ${displayDate(booking.slot.startAt)} at ${displayTime(booking.slot.startAt)}. Looking forward to seeing you!`;
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  if (!key) return success({ message: fallback, source: "template" });
  try {
    const prompt = `Write one short friendly meeting confirmation for ${booking.guestName}, scheduled ${displayDate(booking.slot.startAt)} at ${displayTime(booking.slot.startAt)}. Do not mention email addresses.`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    if (!response.ok) return success({ message: fallback, source: "template" });
    const json = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const message = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return success({ message: message || fallback, source: message ? "gemini" : "template" });
  } catch { return success({ message: fallback, source: "template" }); }
}
