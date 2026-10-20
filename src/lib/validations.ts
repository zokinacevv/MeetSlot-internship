import { z } from "zod";

export const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm."),
  durationMinutes: z.coerce.number().int().refine((value) => [15, 30, 45, 60, 90, 120].includes(value), "Choose a valid duration.")
});

export const bookingSchema = z.object({
  slotId: z.string().uuid(),
  guestName: z.string().trim().min(1, "Your name is required.").max(100),
  guestEmail: z.string().trim().email("Enter a valid email address.").max(254)
});

export const idSchema = z.string().uuid();
