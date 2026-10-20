export type SlotStatus = "AVAILABLE" | "BOOKED";
export interface PublicSlot { id: string; startAt: string; endAt: string; durationMinutes: number; status: "AVAILABLE"; }
export interface DashboardSlot extends Omit<PublicSlot, "status"> { status: SlotStatus; booking: null | { id: string; guestName: string; guestEmail: string; createdAt: string }; }
export interface ApiSuccess<T> { success: true; data: T; }
export interface ApiFailure { success: false; error: { code: string; message: string }; }
