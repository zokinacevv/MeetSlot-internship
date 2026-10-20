CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED');

CREATE TABLE "Slot" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Booking" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "slotId" UUID NOT NULL,
  "guestName" TEXT NOT NULL,
  "guestEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "canceledAt" TIMESTAMP(3),
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_slotId_key" ON "Booking"("slotId");
CREATE INDEX "Slot_startAt_idx" ON "Slot"("startAt");
CREATE INDEX "Slot_status_startAt_idx" ON "Slot"("status", "startAt");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
