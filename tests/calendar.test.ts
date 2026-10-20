import { describe, expect, it } from "vitest";
import { intervalsOverlap } from "../src/services/calendar.service";

describe("Google Calendar conflict intervals", () => {
  const at = (hour: number) => new Date(`2030-01-01T${String(hour).padStart(2, "0")}:00:00.000Z`);
  it("identifies intersecting appointments", () => expect(intervalsOverlap({ startAt: at(10), endAt: at(11) }, { startAt: at(10), endAt: at(12) })).toBe(true));
  it("allows back-to-back appointments", () => expect(intervalsOverlap({ startAt: at(10), endAt: at(11) }, { startAt: at(11), endAt: at(12) })).toBe(false));
});
