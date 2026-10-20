import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api";
import { idSchema } from "@/lib/validations";
import { deleteSlot, SlotNotFoundError, SlotStateError } from "@/services/slot.service";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return failure("VALIDATION_ERROR", "Invalid slot ID.");
  try { await deleteSlot(id); return success({ id }); }
  catch (error) {
    if (error instanceof SlotNotFoundError) return failure("SLOT_NOT_FOUND", error.message, 404);
    if (error instanceof SlotStateError) return failure("SLOT_BOOKED", error.message, 409);
    return failure("DATABASE_ERROR", "Unable to delete this slot right now.", 503);
  }
}
