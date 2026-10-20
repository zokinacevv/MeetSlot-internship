import { afterAll, beforeEach, describe, expect, it } from "vitest";

// This suite is intentionally enabled only with a dedicated PostgreSQL test DB.
// Run against a dedicated migrated test database: DATABASE_URL=... npm test
const withDatabase = process.env.DATABASE_URL ? describe : describe.skip;

withDatabase("booking concurrency (PostgreSQL)", async () => {
  const { prisma } = await import("../src/lib/prisma");
  const { createBooking } = await import("../src/services/booking.service");
  let slotId: string;
  beforeEach(async () => {
    await prisma.booking.deleteMany(); await prisma.slot.deleteMany();
    const slot = await prisma.slot.create({ data: { startAt: new Date(Date.now() + 86_400_000), endAt: new Date(Date.now() + 90_000_000), durationMinutes: 60 } }); slotId = slot.id;
  });
  afterAll(async () => prisma.$disconnect());
  it("allows exactly one concurrent booking", async () => {
    const outcomes = await Promise.allSettled([createBooking({ slotId, guestName: "A", guestEmail: "a@example.com" }), createBooking({ slotId, guestName: "B", guestEmail: "b@example.com" })]);
    expect(outcomes.filter(x => x.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(x => x.status === "rejected")).toHaveLength(1);
    expect(await prisma.booking.count({ where: { slotId } })).toBe(1);
    expect((await prisma.slot.findUniqueOrThrow({ where: { id: slotId } })).status).toBe("BOOKED");
  });
});
