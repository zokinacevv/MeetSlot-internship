import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { idSchema } from "@/lib/validations";
import { BookingNotFoundError, cancelBooking } from "@/services/booking.service";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return failure("VALIDATION_ERROR", "Invalid booking ID.");
  try { return success({ booking: await cancelBooking(id) }); }
  catch (error) {
    if (error instanceof BookingNotFoundError) return failure("BOOKING_NOT_FOUND", error.message, 404);
    return failure("DATABASE_ERROR", "Unable to cancel this booking right now.", 503);
  }
}
