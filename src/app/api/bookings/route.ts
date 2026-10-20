import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { bookingSchema } from "@/lib/validations";
import { BookingConflictError, createBooking } from "@/services/booking.service";
import { CalendarConflictError, CalendarUnavailableError } from "@/services/calendar.service";

export async function POST(request: NextRequest) {
  try {
    const parsed = bookingSchema.safeParse(await request.json());
    if (!parsed.success) return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid booking details.");
    return success({ booking: await createBooking(parsed.data) }, 201);
  } catch (error) {
    if (error instanceof BookingConflictError) return failure("SLOT_ALREADY_BOOKED", error.message, 409);
    if (error instanceof CalendarConflictError) return failure("CALENDAR_CONFLICT", error.message, 409);
    if (error instanceof CalendarUnavailableError) return failure("CALENDAR_UNAVAILABLE", error.message, 503);
    return failure("DATABASE_ERROR", "Unable to confirm this booking right now.", 503);
  }
}
