import { addDays, set } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const zone = "Europe/Skopje";

async function main() {
  const base = addDays(new Date(), 1);
  for (const hour of [10, 11, 14]) {
    const local = set(base, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
    const startAt = fromZonedTime(local, zone);
    const endAt = new Date(startAt.getTime() + 30 * 60_000);
    const existing = await prisma.slot.findFirst({ where: { startAt, endAt } });
    if (!existing) await prisma.slot.create({ data: { startAt, endAt, durationMinutes: 30 } });
  }
}
main().finally(() => prisma.$disconnect());
