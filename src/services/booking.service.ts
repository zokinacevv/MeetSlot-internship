import { SlotStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { assertNoCalendarConflict } from "@/services/calendar.service";

export class BookingConflictError extends Error {}
export class BookingNotFoundError extends Error {}

export async function createBooking(input: { slotId: string; guestName: string; guestEmail: string }) {
  const slot = await prisma.slot.findUnique({ where: { id: input.slotId }, select: { startAt: true, endAt: true } });
  if (!slot) throw new BookingConflictError("This appointment is no longer available.");
  await assertNoCalendarConflict(slot);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.slot.updateMany({ where: { id: input.slotId, status: SlotStatus.AVAILABLE, startAt: { gt: new Date() } }, data: { status: SlotStatus.BOOKED } });
    if (updated.count !== 1) throw new BookingConflictError("This appointment is no longer available.");
    return tx.booking.create({ data: input, include: { slot: true } });
  });
}

export async function cancelBooking(id: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id }, include: { slot: true } });
    if (!booking) throw new BookingNotFoundError("Booking not found.");
    await tx.booking.delete({ where: { id } });
    if (booking.slot.startAt > new Date()) await tx.slot.update({ where: { id: booking.slotId }, data: { status: SlotStatus.AVAILABLE } });
    return booking;
  });
}
