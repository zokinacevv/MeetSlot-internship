import { Prisma, SlotStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isFuture, zonedDateTimeToUtc } from "@/lib/dates";
import { assertNoCalendarConflict, filterCalendarConflicts } from "@/services/calendar.service";

export class SlotConflictError extends Error {}
export class SlotNotFoundError extends Error {}
export class SlotStateError extends Error {}

export async function createSlot(input: { date: string; startTime: string; durationMinutes: number }) {
  const startAt = zonedDateTimeToUtc(input.date, input.startTime);
  const endAt = new Date(startAt.getTime() + input.durationMinutes * 60_000);
  if (!isFuture(startAt)) throw new SlotStateError("Appointments must be scheduled in the future.");
  await assertNoCalendarConflict({ startAt, endAt });
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('meetslot-slot-creation'))`;
    const overlap = await tx.slot.findFirst({ where: { startAt: { lt: endAt }, endAt: { gt: startAt } }, select: { id: true } });
    if (overlap) throw new SlotConflictError("This appointment overlaps an existing slot.");
    return tx.slot.create({ data: { startAt, endAt, durationMinutes: input.durationMinutes } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function publicSlots() {
  const slots = await prisma.slot.findMany({
    where: { status: SlotStatus.AVAILABLE, startAt: { gt: new Date() } },
    orderBy: { startAt: "asc" },
    select: { id: true, startAt: true, endAt: true, durationMinutes: true, status: true }
  });
  return filterCalendarConflicts(slots);
}

export async function dashboardSlots() {
  return prisma.slot.findMany({ orderBy: { startAt: "asc" }, include: { booking: { select: { id: true, guestName: true, guestEmail: true, createdAt: true } } } });
}

export async function deleteSlot(id: string) {
  const deleted = await prisma.slot.deleteMany({ where: { id, status: SlotStatus.AVAILABLE } });
  if (deleted.count === 1) return;
  const existing = await prisma.slot.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new SlotNotFoundError("Slot not found.");
  throw new SlotStateError("Booked appointments must be canceled, not deleted.");
}
