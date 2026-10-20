import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { LocalTimeError } from "@/lib/dates";
import { slotSchema } from "@/lib/validations";
import { createSlot, publicSlots, SlotConflictError, SlotStateError } from "@/services/slot.service";
import { CalendarConflictError, CalendarUnavailableError } from "@/services/calendar.service";

export async function GET() {
  try { return success({ slots: await publicSlots() }); }
  catch (error) { return failure(error instanceof CalendarUnavailableError ? "CALENDAR_UNAVAILABLE" : "DATABASE_ERROR", error instanceof CalendarUnavailableError ? error.message : "Unable to load availability right now.", 503); }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = slotSchema.safeParse(await request.json());
    if (!parsed.success) return failure("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid slot details.");
    return success({ slot: await createSlot(parsed.data) }, 201);
  } catch (error) {
    if (error instanceof SlotConflictError) return failure("SLOT_OVERLAP", error.message, 409);
    if (error instanceof CalendarConflictError) return failure("CALENDAR_CONFLICT", error.message, 409);
    if (error instanceof CalendarUnavailableError) return failure("CALENDAR_UNAVAILABLE", error.message, 503);
    if (error instanceof LocalTimeError || error instanceof SlotStateError) return failure("INVALID_SLOT", error.message);
    return failure("DATABASE_ERROR", "Unable to create this slot right now.", 503);
  }
}
