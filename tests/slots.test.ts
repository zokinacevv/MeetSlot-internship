import { describe, expect, it } from "vitest";
import { slotSchema } from "../src/lib/validations";

describe("slot validation", () => {
  it("accepts a well-formed slot", () => expect(slotSchema.safeParse({ date: "2030-11-02", startTime: "10:00", durationMinutes: 30 }).success).toBe(true));
  it("rejects malformed dates and durations", () => {
    expect(slotSchema.safeParse({ date: "02/11/2030", startTime: "10:00", durationMinutes: 31 }).success).toBe(false);
  });
});
